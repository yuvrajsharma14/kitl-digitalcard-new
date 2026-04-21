import { Resend } from "resend";

const FROM_EMAIL = "My Digital Card <noreply@mydigitalcard.app>";
const APP_URL = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

// Lazy — only instantiate when a key is present so missing keys don't crash at module load time
function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured. Add it to your .env file.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${token}`;
  const firstName = name.split(" ")[0];

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your email — My Digital Card",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:40px 32px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#2563eb;border-radius:12px;">
                <span style="color:#fff;font-size:20px;">&#9635;</span>
              </div>
              <p style="margin:12px 0 0;font-weight:700;font-size:18px;color:#111827;">My Digital Card</p>
            </div>
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Hi ${firstName},</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              Thanks for signing up! Please verify your email address to activate your account.
            </p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Verify Email Address
              </a>
            </div>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
              Or copy this link into your browser:
            </p>
            <p style="margin:0 0 24px;font-size:12px;color:#6b7280;word-break:break-all;text-align:center;">
              ${url}
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${token}`;
  const firstName = name.split(" ")[0];

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your password — My Digital Card",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Inter,Arial,sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
          <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:40px 32px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#2563eb;border-radius:12px;">
                <span style="color:#fff;font-size:20px;">&#9635;</span>
              </div>
              <p style="margin:12px 0 0;font-weight:700;font-size:18px;color:#111827;">My Digital Card</p>
            </div>
            <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Hi ${firstName},</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
              You requested a password reset. Click the button below to set a new password.
            </p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Reset Password
              </a>
            </div>
            <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
              Or copy this link into your browser:
            </p>
            <p style="margin:0 0 24px;font-size:12px;color:#6b7280;word-break:break-all;text-align:center;">
              ${url}
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}
