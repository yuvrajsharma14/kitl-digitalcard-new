# AWS Deployment Guide — My Digital Card (Single EC2)

Everything runs on one EC2 instance: Next.js, PostgreSQL, Redis — all in Docker Compose.  
Nginx runs on the host and proxies to the app. Let's Encrypt provides free SSL.

**Estimated monthly cost: ~$16–20/month**

| Service | Config | Cost |
|---|---|---|
| EC2 t3.small | 2 vCPU, 2 GB RAM | ~$15/mo |
| ECR | ~1 GB image storage | ~$0.10/mo |
| Elastic IP | Static public IP | ~$0/mo (free while attached) |
| Data transfer | Low traffic | ~$1–2/mo |

No RDS, no ElastiCache, no ALB, no NAT Gateway — everything is on the box.

---

## Architecture

```
Internet
   │  HTTPS 443 / HTTP 80
   ▼
EC2 t3.small  (Ubuntu 22.04)
├── Nginx  (host, reverse proxy + SSL termination)
│      └── proxy_pass → 127.0.0.1:3000
└── Docker Compose
       ├── web        (Next.js, port 3000 — localhost only)
       ├── postgres   (PostgreSQL 15, internal network)
       └── redis      (Redis 7, internal network)

ECR  ←  GitHub Actions builds & pushes images here
```

---

## Part 1 — AWS Setup

### Step 1 — Launch an EC2 instance

Go to **EC2 → Launch Instance**:

| Setting | Value |
|---|---|
| Name | `mydigitalcard-server` |
| AMI | Ubuntu Server 22.04 LTS (64-bit x86) |
| Instance type | `t3.small` (2 GB RAM — needed for Docker) |
| Key pair | Create new → download `.pem` file, keep it safe |
| Security group | Create new — see rules below |
| Storage | 20 GB gp3 |

**Security group rules** (`mdc-sg`):

| Type | Port | Source | Purpose |
|---|---|---|---|
| SSH | 22 | Your IP only | Admin access |
| HTTP | 80 | 0.0.0.0/0 | Let's Encrypt + redirect |
| HTTPS | 443 | 0.0.0.0/0 | App traffic |

> Do **not** open port 3000 to the internet — Nginx proxies to it on localhost.

### Step 2 — Attach an Elastic IP

Go to **EC2 → Elastic IPs → Allocate → Associate** with your instance.  
This gives you a permanent IP that survives reboots.

Note the IP address — you'll use it everywhere.

### Step 3 — Point your domain to the EC2

In your DNS provider, add:

```
Type    Name    Value
A       @       <your Elastic IP>
A       www     <your Elastic IP>
```

DNS propagation takes 5–30 minutes. Verify with:
```bash
dig mydigitalcard.app +short
# should return your Elastic IP
```

### Step 4 — Create ECR repositories

```bash
aws ecr create-repository --repository-name mydigitalcard-web     --region ap-south-1
aws ecr create-repository --repository-name mydigitalcard-migrate --region ap-south-1
```

Note the registry URL: `ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com`

### Step 5 — Create a deploy IAM user

In **IAM → Users → Create user** (name: `github-actions-deploy`).

Attach these policies:
- `AmazonEC2ContainerRegistryPowerUser` (built-in)

Create **Access Keys** for the user and save them — you'll add them as GitHub secrets.

The EC2 instance also needs ECR pull permissions. Attach the `AmazonEC2ContainerRegistryReadOnly` policy to the EC2's **IAM Instance Profile** (or create one if missing):

1. **IAM → Roles → Create role** → trusted entity: EC2
2. Attach `AmazonEC2ContainerRegistryReadOnly`
3. Name it `mydigitalcard-ec2-role`
4. **EC2 → Instance → Actions → Security → Modify IAM role** → attach `mydigitalcard-ec2-role`

---

## Part 2 — EC2 Server Setup

SSH into your instance:
```bash
ssh -i your-key.pem ubuntu@<your-elastic-ip>
```

### Step 1 — Install Docker

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Run Docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker
```

### Step 2 — Install AWS CLI and Nginx

```bash
sudo apt-get install -y awscli nginx certbot python3-certbot-nginx
```

### Step 3 — Add swap space (prevents OOM on 2 GB RAM)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 4 — Create the app directory and env file

```bash
sudo mkdir -p /opt/mydigitalcard
sudo chown ubuntu:ubuntu /opt/mydigitalcard
cd /opt/mydigitalcard
```

Create the environment file:
```bash
cat > .env.prod << 'EOF'
# Database
POSTGRES_USER=mdc_user
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Redis
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# ECR registry  (ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com)
ECR_REGISTRY=123456789.dkr.ecr.ap-south-1.amazonaws.com

# App
NEXTAUTH_URL=https://mydigitalcard.app
NEXTAUTH_SECRET=CHANGE_THIS_RUN_openssl_rand_base64_32
AUTH_SECRET=SAME_VALUE_AS_NEXTAUTH_SECRET

# Optional — fill in when you have the keys
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
EOF
```

> Keep this file **on the server only** — never commit it to git.

Copy the production Compose file from the repo (after pushing to GitHub):
```bash
# Or copy manually
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/docker-compose.prod.yml \
  -o docker-compose.prod.yml
```

### Step 5 — Configure Nginx

Copy the Nginx config from the repo:
```bash
sudo cp /opt/mydigitalcard/nginx/mydigitalcard.conf \
  /etc/nginx/sites-available/mydigitalcard.conf

sudo ln -s /etc/nginx/sites-available/mydigitalcard.conf \
  /etc/nginx/sites-enabled/mydigitalcard.conf

sudo rm -f /etc/nginx/sites-enabled/default
```

**Before getting the SSL cert**, temporarily comment out the `ssl_certificate` lines in the config (Nginx won't start without the cert). Replace the HTTPS server block with a simple proxy:

```bash
sudo nano /etc/nginx/sites-available/mydigitalcard.conf
# Comment out the two ssl_certificate lines temporarily
```

Test and reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Step 6 — Get SSL certificate

Make sure DNS is already pointing to this IP, then:

```bash
sudo certbot --nginx -d mydigitalcard.app -d www.mydigitalcard.app \
  --non-interactive --agree-tos -m your@email.com
```

Certbot automatically updates the Nginx config with the cert paths and sets up auto-renewal.  
Verify renewal works:
```bash
sudo certbot renew --dry-run
```

### Step 7 — Set up automatic cert renewal

```bash
# Certbot installs a systemd timer — verify it's active
sudo systemctl status certbot.timer

# If not, add a cron job as fallback
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
```

---

## Part 3 — First Deployment

### Build and push images from your local machine

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

# Build and push web image
docker build -f apps/web/Dockerfile \
  -t ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mydigitalcard-web:latest \
  .
docker push ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mydigitalcard-web:latest

# Build and push migrate image
docker build -f apps/web/Dockerfile.migrate \
  -t ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mydigitalcard-migrate:latest \
  .
docker push ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/mydigitalcard-migrate:latest
```

### Start the app on EC2

```bash
cd /opt/mydigitalcard

# Pull images (EC2 IAM role gives it ECR read access)
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

docker compose -f docker-compose.prod.yml --env-file .env.prod pull

# Run migration
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm migrate

# Start the app
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d web postgres redis
```

Check it's running:
```bash
docker compose -f docker-compose.prod.yml ps
curl -I http://127.0.0.1:3000/
```

Visit `https://mydigitalcard.app` — it should load.

---

## Part 4 — GitHub Actions CI/CD

Every push to `main` will: lint → build images → push to ECR → SSH into EC2 → pull + restart.

### Step 1 — Add GitHub repository secrets

**Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Access key for `github-actions-deploy` IAM user |
| `AWS_SECRET_ACCESS_KEY` | Secret key for `github-actions-deploy` IAM user |
| `EC2_HOST` | Your Elastic IP address |
| `EC2_SSH_KEY` | Full contents of your `.pem` key file |

To get `EC2_SSH_KEY`:
```bash
cat your-key.pem
# Copy everything including -----BEGIN RSA PRIVATE KEY----- and -----END RSA PRIVATE KEY-----
```

### Step 2 — Update the workflow region

Open [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) and confirm:
```yaml
env:
  AWS_REGION: ap-south-1    # ← matches your ECR region
```

### Step 3 — How the pipeline works

```
git push to main
      │
      ▼
  [lint]
  ESLint + TypeScript — runs on every push and PR
      │
      ▼ (main branch only)
  [build-and-push]
  Build web + migrate Docker images in GitHub Actions
  Push both to ECR with :SHA tag and :latest tag
      │
      ▼
  [deploy]
  SSH into EC2
  ├── docker login to ECR
  ├── docker compose pull  (pulls new :latest images)
  ├── docker compose run --rm migrate  (runs migration, must exit 0)
  ├── docker compose up -d --no-deps web  (restarts only the web container)
  └── docker image prune  (removes old images)
```

- PRs only run lint — no build, no deploy
- Migration runs before the new web container starts — safe schema rollouts
- `--no-deps web` restarts only the web container, postgres and redis keep running

---

## Part 5 — Post-deployment checklist

- [ ] `https://mydigitalcard.app` loads the landing page
- [ ] `https://www.mydigitalcard.app` redirects to non-www (or both work)
- [ ] `http://mydigitalcard.app` redirects to HTTPS
- [ ] `/login` and `/signup` work
- [ ] Create a card and visit its public URL `/u/<slug>`
- [ ] Download `.vcf` from the public card page
- [ ] Admin portal `/admin` loads (login: `admin@mydigitalcard.app`)
- [ ] Push a test commit to `main` and watch the GitHub Actions pipeline complete

---

## Part 6 — Operations

### View live logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Web app only
docker compose -f docker-compose.prod.yml logs -f web
```

### Restart the app
```bash
cd /opt/mydigitalcard
docker compose -f docker-compose.prod.yml --env-file .env.prod restart web
```

### Update an env variable
```bash
nano /opt/mydigitalcard/.env.prod
# Edit the value, then:
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --no-deps web
```

### Run a manual migration
```bash
cd /opt/mydigitalcard
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm migrate
```

### Connect to the database
```bash
docker exec -it mdc_postgres psql -U mdc_user -d mydigitalcard
```

### Backup the database
```bash
docker exec mdc_postgres pg_dump -U mdc_user mydigitalcard \
  > ~/backup-$(date +%Y%m%d-%H%M%S).sql
```

### Check disk usage
```bash
df -h
docker system df
```

---

## Part 7 — Upgrading to production later

When traffic grows, these are the natural upgrade paths:

| Bottleneck | Solution |
|---|---|
| Memory/CPU | Resize EC2 to `t3.medium` ($30/mo) — no other changes needed |
| Database reliability | Migrate postgres data to RDS — update `DATABASE_URL` in `.env.prod` |
| Downtime during deploys | Add a second EC2 + ALB for zero-downtime blue/green deploys |
| Storage | Move uploads to S3 / Cloudinary (already wired in env) |
