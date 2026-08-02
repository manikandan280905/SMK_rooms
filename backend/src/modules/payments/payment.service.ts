import prisma from '../../config/database';
import { PaymentStatus } from '@prisma/client';
import { parsePagination } from '../../utils/pagination';

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

    if (params.status) {
      where.paymentStatus = params.status;
    }
    if (params.method) {
      where.paymentMethod = params.method;
    }
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              guest: { select: { id: true, name: true, phone: true } },
              room: { select: { id: true, roomNumber: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async getById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            guest: true,
            room: true,
          },
        },
      },
    });
    if (!payment) {
      throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    }
    return payment;
  }

  async update(id: string, data: any, adminId: string) {
    const payment = await prisma.payment.update({
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
