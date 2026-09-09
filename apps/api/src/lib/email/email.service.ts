import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../logger.js';

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer; // base64 string or Buffer
    contentType: string;
  }>;
};

let transporter: Transporter | null = null;
let isEthereal = false;

/**
 * Lazily initializes the email transporter.
 * - If EMAIL_USER is set in env, uses the configured SMTP server.
 * - If EMAIL_USER is not set, auto-creates an Ethereal test account so local
 *   dev requires zero setup. The Ethereal preview URL is logged after each send.
 */
async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  if (env.EMAIL_USER) {
    // Configured SMTP (production / staging)
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
    isEthereal = false;
    logger.info({ host: env.EMAIL_HOST, port: env.EMAIL_PORT }, '[Email] Using configured SMTP server');
  } else {
    // Ethereal auto-account for local development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
    logger.info(
      { user: testAccount.user, web: 'https://ethereal.email/messages' },
      '[Email] Using Ethereal test account — emails will not be delivered to real inboxes'
    );
  }

  return transporter;
}

export const emailService = {
  async sendEmail(options: SendEmailOptions): Promise<void> {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    logger.info({ messageId: info.messageId, to: options.to, subject: options.subject }, '[Email] Email sent');

    // Log the Ethereal preview URL so developers can inspect emails locally
    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info({ previewUrl }, '[Email] 📧 Ethereal preview URL (open in browser to view email)');
    }
  },
};
