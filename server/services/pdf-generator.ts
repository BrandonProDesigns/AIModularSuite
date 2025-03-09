import PDFDocument from 'pdfkit';
import { Invoice } from '@shared/schema';

export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add company logo/header
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Add invoice details
    doc.fontSize(12);
    doc.text(`Invoice #: ${invoice.id}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();

    // Add customer info
    doc.text(`Customer: ${invoice.customerName}`);
    doc.moveDown();

    // Add description
    doc.text('Description:');
    doc.text(invoice.description);
    doc.moveDown();

    // Add amount
    doc.fontSize(14);
    doc.text(`Amount Due: $${Number(invoice.amount).toFixed(2)}`, { align: 'right' });

    doc.end();
  });
}
