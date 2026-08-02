import prisma from '../../config/database';
import { BookingStatus } from '@prisma/client';

export class ReportService {
  async getDailyReport(date: string, lodgeId?: string) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const where: any = {
      OR: [
        { arrivalDate: { gte: startOfDay, lt: endOfDay } },
        { departureDate: { gte: startOfDay, lt: endOfDay } },
        { status: BookingStatus.CHECKED_IN, arrivalDate: { lt: endOfDay } },
      ],
    };

    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        lodge: true,
        guest: true,
        room: true,
      },
      orderBy: { arrivalDate: 'asc' },
    });

    return bookings;
  }

  async getMonthlyReport(year: number, month: number, lodgeId?: string) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const bookingWhere: any = { arrivalDate: { gte: startOfMonth, lte: endOfMonth } };
    const guestWhere: any = { createdAt: { gte: startOfMonth, lte: endOfMonth } };

    if (lodgeId && lodgeId !== 'ALL') {
      bookingWhere.lodgeId = lodgeId;
      guestWhere.lodgeId = lodgeId;
    }

    const [bookings, revenue, totalGuests] = await Promise.all([
      prisma.booking.findMany({
        where: bookingWhere,
        include: {
          lodge: true,
          guest: { select: { name: true, phone: true } },
          room: { select: { roomNumber: true, roomType: true } },
        },
        orderBy: { arrivalDate: 'asc' },
      }),
      prisma.booking.aggregate({
        where: bookingWhere,
        _sum: { totalAmount: true, advanceAmount: true },
      }),
      prisma.guest.count({ where: guestWhere }),
    ]);

    return {
      bookings,
      summary: {
        totalRevenue: revenue._sum.totalAmount || 0,
        totalAdvance: revenue._sum.advanceAmount || 0,
        totalGuests,
        totalBookings: bookings.length,
      },
    };
  }

  async getRevenueReport(dateFrom: string, dateTo: string, lodgeId?: string) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const where: any = { createdAt: { gte: from, lte: to } };
    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        lodge: true,
        guest: { select: { name: true, phone: true } },
        room: { select: { roomNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totals = await prisma.booking.aggregate({
      where,
      _sum: { totalAmount: true, advanceAmount: true },
      _count: true,
    });

    return { bookings, totals };
  }

  async getOccupancyReport(lodgeId?: string) {
    const roomWhere: any = {};
    if (lodgeId && lodgeId !== 'ALL') {
      roomWhere.lodgeId = lodgeId;
    }

    const rooms = await prisma.room.findMany({
      where: roomWhere,
      include: {
        lodge: true,
        bookings: {
          where: { status: BookingStatus.CHECKED_IN },
          include: {
            guest: { select: { name: true, phone: true } },
          },
          take: 1,
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const occupancyRate = totalRooms > 0 ? ((occupied / totalRooms) * 100).toFixed(1) : '0';

    return { rooms, totalRooms, occupied, occupancyRate };
  }

  async getGuestHistory(dateFrom?: string, dateTo?: string, lodgeId?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    return prisma.guest.findMany({
      where,
      include: {
        lodge: true,
        bookings: {
          include: {
            room: { select: { roomNumber: true, roomType: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCurrentGuests(lodgeId?: string) {
    const where: any = { status: BookingStatus.CHECKED_IN };
    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    return prisma.booking.findMany({
      where,
      include: {
        lodge: true,
        guest: true,
        room: true,
      },
      orderBy: { arrivalDate: 'desc' },
    });
  }

  async getCheckoutReport(dateFrom: string, dateTo: string, lodgeId?: string) {
    const where: any = {
      status: BookingStatus.CHECKED_OUT,
      departureDate: {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      },
    };

    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    return prisma.booking.findMany({
      where,
      include: {
        lodge: true,
        guest: { select: { name: true, phone: true, aadhaarNumber: true } },
        room: { select: { roomNumber: true, roomType: true } },
      },
      orderBy: { departureDate: 'desc' },
    });
  }

  async getPendingPayments(lodgeId?: string) {
    const where: any = {
      status: BookingStatus.CHECKED_IN,
    };

    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    return prisma.booking.findMany({
      where,
      include: {
        lodge: true,
        guest: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, roomNumber: true, price: true } },
      },
      orderBy: { arrivalDate: 'asc' },
    });
  }
}

export const reportService = new ReportService();
