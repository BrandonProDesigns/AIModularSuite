import nodemailer from 'nodemailer';
import { Invoice } from '@shared/schema';

// Create reusable transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendInvoiceEmail(invoice: Invoice, recipientEmail: string, pdfBuffer: Buffer) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Invoice #${invoice.id} from Your Business`,
    text: `Please find attached invoice #${invoice.id} for $${Number(invoice.amount).toFixed(2)}`,
    attachments: [
      {
        filename: `invoice-${invoice.id}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send invoice email');
  }
}
