import prisma from '../../config/database';

export class LodgeService {
  async getAll() {
    return prisma.lodge.findMany({
      include: {
        _count: {
          select: { rooms: true, bookings: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    const lodge = await prisma.lodge.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });
    if (!lodge) {
      throw Object.assign(new Error('Lodge not found'), { statusCode: 404 });
    }
    return lodge;
  }
}

export const lodgeService = new LodgeService();
