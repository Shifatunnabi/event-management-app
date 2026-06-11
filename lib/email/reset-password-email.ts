import { sendEmailWithRetry } from "./ticket-email"

export async function sendPasswordResetEmail(
  userEmail: string,
  code: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ff7c07; color: white; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background-color: #f9f9f9; padding: 32px 30px; border-radius: 0 0 8px 8px; }
        .code-box {
          background-color: #ffffff;
          border: 2px solid #ff7c07;
          border-radius: 10px;
          padding: 28px 20px;
          text-align: center;
          margin: 28px 0;
        }
        .code {
          font-size: 36px;
          font-weight: bold;
          color: #ff7c07;
          letter-spacing: 8px;
          display: block;
          margin-bottom: 10px;
        }
        .expiry { font-size: 13px; color: #888; margin: 0; }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password for your <strong>EventGhor</strong> account.</p>
          <p>Enter the following verification code in the app:</p>
          <div class="code-box">
            <span class="code">${code}</span>
            <p class="expiry">This code expires in 15 minutes.</p>
          </div>
          <p>If you did not request a password reset, please ignore this email — your account remains secure.</p>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; EventGhor. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmailWithRetry({
    to: userEmail,
    subject: "EventGhor — Password Reset Code",
    html,
  })
}
