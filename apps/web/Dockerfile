# ─────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ─────────────────────────────────────────
# Stage 2: Build the application
# ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

WORKDIR /app/apps/web

# Generate Prisma client
RUN npx prisma generate

# Flatten pnpm Prisma paths so runner stage can COPY them
RUN mkdir -p /prisma-flat/prisma-client /prisma-flat/prisma-pkg && \
    find /app/node_modules -path "*/.prisma/client" -type d 2>/dev/null | head -1 | \
      xargs -I{} sh -c 'cp -rL {} /prisma-flat/prisma-client' && \
    find /app/node_modules -maxdepth 8 -path "*/@prisma/client" -type d 2>/dev/null | head -1 | \
      xargs -I{} sh -c 'cp -rL {} /prisma-flat/prisma-pkg'

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─────────────────────────────────────────
# Stage 3: Production runner
# ─────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output — outputFileTracingRoot mirrors monorepo root,
# so standalone contents land at apps/web/server.js inside /app
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Static assets and public must match the mirrored path
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Prisma schema for runtime
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma
# Copy Prisma generated client (normalized from pnpm virtual store)
COPY --from=builder /prisma-flat/prisma-client ./node_modules/.prisma/client
COPY --from=builder /prisma-flat/prisma-pkg ./node_modules/@prisma/client

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is at apps/web/server.js due to outputFileTracingRoot
CMD ["node", "apps/web/server.js"]
