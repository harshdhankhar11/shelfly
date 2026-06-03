export function getVerificationEmailHtml(fullName: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Shelfly Account</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: #0d9488;
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 40px 32px;
          }
          .greeting {
            font-size: 16px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 16px;
            color: #0f172a;
          }
          .message {
            font-size: 14px;
            line-height: 24px;
            color: #475569;
            margin-bottom: 32px;
          }
          .otp-container {
            background-color: #f0fdfa;
            border: 1px solid #ccfbf1;
            border-radius: 6px;
            padding: 24px;
            text-align: center;
            margin-bottom: 32px;
          }
          .otp-code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 0.25em;
            color: #0d9488;
            margin: 0;
            padding-left: 0.25em;
          }
          .validity {
            font-size: 12px;
            color: #0f766e;
            margin-top: 8px;
            margin-bottom: 0;
            font-weight: 500;
          }
          .warning {
            font-size: 12px;
            line-height: 20px;
            color: #64748b;
            border-top: 1px solid #f1f5f9;
            padding-top: 24px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            font-size: 11px;
            color: #94a3b8;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Shelfly</h1>
          </div>
          <div class="content">
            <h2 class="greeting">Hello ${fullName},</h2>
            <p class="message">
              Thank you for signing up for Shelfly. To complete your account registration, please verify your email address using the one-time verification code below:
            </p>
            <div class="otp-container">
              <h2 class="otp-code">${otp}</h2>
              <p class="validity">This code is valid for 5 minutes.</p>
            </div>
            <p class="warning">
              If you did not request this verification code, you can safely ignore this email. Someone may have typed your email address by mistake.
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Shelfly. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
