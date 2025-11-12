import nodemailer from 'nodemailer';
import { configDb } from '../db';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  password: string
): Promise<boolean> {
  const emailId = uuidv4();
  const subject = 'Welcome to BrewedAt Admin';
  const fromEmail = configDb.getByKey('from_email')?.value || 'noreply@chrispeterkins.com';

  try {
    // Get SMTP configuration from database
    const smtpHost = configDb.getByKey('smtp_host')?.value;
    const smtpPort = configDb.getByKey('smtp_port')?.value;
    const smtpUser = configDb.getByKey('smtp_user')?.value;
    const smtpPassword = configDb.getByKey('smtp_password')?.value;
    const fromName = configDb.getByKey('from_name')?.value || 'BrewedAt';
    const siteName = configDb.getByKey('site_name')?.value || 'BrewedAt';

    if (!smtpHost || !smtpPort) {
      console.error('SMTP configuration incomplete');
      // Log failed attempt
      db.prepare(`
        INSERT INTO email_logs (id, recipient, subject, from_email, status, error_message, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(emailId, userEmail, subject, fromEmail, 'failed', 'SMTP configuration incomplete', new Date().toISOString());
      return false;
    }

    // Create transporter
    const transportConfig: any = {
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
    };

    // Only add auth if credentials are provided (not needed for localhost Postfix)
    if (smtpUser && smtpPassword) {
      transportConfig.auth = {
        user: smtpUser,
        pass: smtpPassword,
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Email content
    const emailSubject = `Welcome to ${siteName} Admin`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B4513; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
            .credentials { background-color: #FFF8F0; border: 2px solid #8B4513; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credential-row { margin: 10px 0; }
            .label { font-weight: bold; color: #654321; }
            .value { font-family: monospace; background-color: #f5f5f5; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-left: 10px; }
            .button { display: inline-block; background-color: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            .warning { background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${siteName}!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'there'},</p>
              <p>An admin account has been created for you on <strong>${siteName}</strong>. Here are your login credentials:</p>

              <div class="credentials">
                <div class="credential-row">
                  <span class="label">Email:</span>
                  <span class="value">${userEmail}</span>
                </div>
                <div class="credential-row">
                  <span class="label">Temporary Password:</span>
                  <span class="value">${password}</span>
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
              </div>

              <p style="text-align: center;">
                <a href="https://chrispeterkins.com/brewedat/admin" class="button">Go to Admin Dashboard</a>
              </p>

              <p>If you have any questions, please contact the site administrator.</p>

              <div class="footer">
                <p>This is an automated message from ${siteName}.</p>
                <p>Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to ${siteName}!

An admin account has been created for you.

Login Credentials:
Email: ${userEmail}
Temporary Password: ${password}

Please change your password after your first login for security purposes.

Login at: https://chrispeterkins.com/brewedat/admin

If you have any questions, please contact the site administrator.
    `;

    // Log email attempt
    db.prepare(`
      INSERT INTO email_logs (id, recipient, subject, from_email, status, sent_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(emailId, userEmail, emailSubject, fromEmail, 'sending', new Date().toISOString());

    // Send email
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: userEmail,
      subject: emailSubject,
      text,
      html,
    });

    // Update status to sent
    db.prepare(`
      UPDATE email_logs SET status = ?, delivered_at = ? WHERE id = ?
    `).run('sent', new Date().toISOString(), emailId);

    return true;
  } catch (error: any) {
    console.error('Error sending welcome email:', error);

    // Log error
    db.prepare(`
      UPDATE email_logs SET status = ?, error_message = ? WHERE id = ?
    `).run('failed', error.message || 'Unknown error', emailId);

    return false;
  }
}
