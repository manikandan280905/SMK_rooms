import prisma from '../../config/database';
import { CreateRoomInput, UpdateRoomInput } from './room.schema';
import { logActivity } from '../../utils/logger';

export class RoomService {
  async create(data: CreateRoomInput, adminId: string) {
    const room = await prisma.room.create({
      data: {
        ...data,
        dailyPrice: data.dailyPrice || data.price,
        createdBy: adminId,
        updatedBy: adminId,
      },
      include: { lodge: true },
    });
    await logActivity(adminId, 'ROOM_CREATED', 'room', room.id, `Room ${data.roomNumber} created`);
    return room;
  }

  async getAll(lodgeId?: string, status?: string) {
    const where: any = {};
    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }
    if (status) {
      where.status = status;
    }

    return prisma.room.findMany({
      where,
      include: { lodge: true },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async getById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        lodge: true,
        bookings: {
          where: { status: 'CHECKED_IN' },
          include: { guest: true },
          take: 1,
        },
      },
    });
    if (!room) {
      throw Object.assign(new Error('Room not found'), { statusCode: 404 });
    }
    return room;
  }

  async update(id: string, data: UpdateRoomInput, adminId: string) {
    const room = await prisma.room.update({
      where: { id },
      data: { ...data, updatedBy: adminId },
      include: { lodge: true },
    });
    await logActivity(adminId, 'ROOM_UPDATED', 'room', room.id, `Room ${room.roomNumber} updated`);
    return room;
  }

  async delete(id: string, adminId: string) {
    const activeBookings = await prisma.booking.count({
      where: { roomId: id, status: 'CHECKED_IN' },
    });
    if (activeBookings > 0) {
      throw Object.assign(new Error('Cannot delete room with active bookings'), { statusCode: 400 });
    }
    const room = await prisma.room.delete({ where: { id } });
    await logActivity(adminId, 'ROOM_DELETED', 'room', id, `Room ${room.roomNumber} deleted`);
    return room;
  }

  async getAvailable(lodgeId?: string) {
    const where: any = { status: { in: ['AVAILABLE', 'RESERVED'] } };
    if (lodgeId && lodgeId !== 'ALL') {
      where.lodgeId = lodgeId;
    }

    return prisma.room.findMany({
      where,
      include: { lodge: true },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }
}

export const roomService = new RoomService();
