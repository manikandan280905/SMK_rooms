import prisma from '../../config/database';
import { BookingStatus } from '@prisma/client';

export class DashboardService {
  async getDashboardData(lodgeId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const isLodgeFiltered = lodgeId && lodgeId !== 'ALL';
    const roomWhere = isLodgeFiltered ? { lodgeId } : {};
    const guestWhere = isLodgeFiltered ? { lodgeId } : {};
    const bookingWhere = isLodgeFiltered ? { lodgeId } : {};

    const [
      totalRooms,
      roomStatusCounts,
      acRoomBreakdown,
      todaysGuests,
      currentCheckIns,
      todaysCheckOuts,
      todaysRevenue,
      monthlyRevenue,
      recentCheckIns,
    ] = await Promise.all([
      // Total rooms
      prisma.room.count({ where: roomWhere }),

      // Room status summary (grouped by status)
      prisma.room.groupBy({
        by: ['status'],
        where: roomWhere,
        _count: { id: true },
      }),

      // AC vs Non-AC breakdown for AVAILABLE rooms only
      prisma.room.groupBy({
        by: ['status', 'isAC'],
        where: { ...roomWhere },
        _count: { id: true },
      }),

      // Today's new guests
      prisma.guest.count({
        where: { ...guestWhere, createdAt: { gte: startOfDay, lt: endOfDay } },
      }),

      // Currently checked in
      prisma.booking.count({
        where: { ...bookingWhere, status: BookingStatus.CHECKED_IN },
      }),

      // Today's checkouts
      prisma.booking.count({
        where: {
          ...bookingWhere,
          status: BookingStatus.CHECKED_OUT,
          departureDate: { gte: startOfDay, lt: endOfDay },
        },
      }),

      // Today's revenue
      prisma.booking.aggregate({
        where: { ...bookingWhere, createdAt: { gte: startOfDay, lt: endOfDay } },
        _sum: { totalAmount: true },
      }),

      // Monthly revenue
      prisma.booking.aggregate({
        where: { ...bookingWhere, createdAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { totalAmount: true },
      }),

      // Recent check-ins (last 10)
      prisma.booking.findMany({
        where: { ...bookingWhere, status: BookingStatus.CHECKED_IN },
        include: {
          lodge: true,
          guest: { select: { id: true, name: true, phone: true } },
          room: { select: { id: true, roomNumber: true, roomType: true, isAC: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Process room status counts
    const statusMap: Record<string, number> = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
      RESERVED: 0,
    };
    for (const item of roomStatusCounts) {
      statusMap[item.status] = item._count.id;
    }

    const roomStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // Build AC/Non-AC breakdown per status
    const acBreakdown: Record<string, { ac: number; nonAc: number }> = {};
    for (const item of acRoomBreakdown) {
      if (!acBreakdown[item.status]) {
        acBreakdown[item.status] = { ac: 0, nonAc: 0 };
      }
      if (item.isAC) {
        acBreakdown[item.status].ac += item._count.id;
      } else {
        acBreakdown[item.status].nonAc += item._count.id;
      }
    }

    return {
      totalRooms,
      availableRooms: statusMap.AVAILABLE,
      occupiedRooms: statusMap.OCCUPIED,
      todaysGuests,
      currentCheckIns,
      todaysCheckOuts,
      todaysRevenue: todaysRevenue._sum.totalAmount || 0,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      recentCheckIns,
      roomStatus,
      acBreakdown,
    };
  }
}

export const dashboardService = new DashboardService();
