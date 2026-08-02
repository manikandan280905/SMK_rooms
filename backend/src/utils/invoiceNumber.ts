import prisma from '../config/database';

/**
 * Generates a unique invoice number in format: INV-YYYYMMDD-XXXX
 */
export async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}`;

  // Count today's payments to generate sequence
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const count = await prisma.payment.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `${prefix}-${sequence}`;
}
