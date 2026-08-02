import prisma from '../../config/database';

export class PaymentService {
  async getAll(params: {
    page: number;
    limit: number;
    skip: number;
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
    }

    const [payments, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          guest: { select: { id: true, name: true, phone: true } },
          room: { select: { id: true, roomNumber: true } },
          lodge: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return { payments, total };
  }

  async getById(id: string) {
    const payment = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        room: true,
        lodge: true,
      },
    });
    if (!payment) {
      throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    }
    return payment;
  }

  async update(id: string, data: any, adminId: string) {
    const payment = await prisma.booking.update({
      where: { id },
      data: {
        ...data,
        updatedBy: adminId,
      },
    });
    return payment;
  }
}

export const paymentService = new PaymentService();
