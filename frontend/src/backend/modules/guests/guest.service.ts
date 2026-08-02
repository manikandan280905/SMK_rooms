import prisma from '../../config/database';
import { Prisma, BookingStatus, RoomStatus, DocumentType } from '@prisma/client';
import { CreateGuestInput, UpdateGuestInput, CheckoutInput } from './guest.schema';
import { logActivity } from '../../utils/logger';

export class GuestService {
  async create(data: CreateGuestInput, adminId: string) {
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: { lodge: true },
    });

    if (!room) {
      throw Object.assign(new Error('Selected room not found'), { statusCode: 404 });
    }

    const lodgeId = data.lodgeId || room.lodgeId;
    const totalGuests = (data.adults || 1) + (data.children || 0);

    // Calculate extra guest charge & base rent
    let basePrice = room.dailyPrice || room.price;
    if (room.roomType === 'MONTHLY') {
      basePrice = room.monthlyPrice || data.roomRent;
    }
    const extraGuests = Math.max(0, totalGuests - (room.maxOccupancy || 2));
    const extraGuestChargeTotalPerDay = extraGuests * (room.extraGuestCharge || 0);
    const calculatedRoomRent = room.roomType === 'MONTHLY' ? basePrice : basePrice + extraGuestChargeTotalPerDay;

    const result = await prisma.$transaction(async (tx) => {
      // Create guest
      const guest = await tx.guest.create({
        data: {
          lodgeId,
          name: data.name,
          fatherName: data.fatherName,
          address: data.address,
          phone: data.phone,
          altPhone: data.altPhone,
          gender: data.gender,
          age: data.age,
          occupation: data.occupation,
          nationality: data.nationality,
          purposeOfVisit: data.purposeOfVisit,
          adults: data.adults,
          children: data.children,
          vehicleNumber: data.vehicleNumber,
          emergencyContact: data.emergencyContact,
          email: data.email || null,
          aadhaarNumber: data.aadhaarNumber,
          passportNumber: data.passportNumber,
          remarks: data.remarks,
          internalNotes: data.internalNotes,
          createdBy: adminId,
          updatedBy: adminId,
        },
      });

      // Attach documents if provided
      const docsToInsert = [];
      if (data.aadhaarFrontUrl) docsToInsert.push({ guestId: guest.id, documentType: DocumentType.AADHAAR_FRONT, fileUrl: data.aadhaarFrontUrl });
      if (data.aadhaarBackUrl) docsToInsert.push({ guestId: guest.id, documentType: DocumentType.AADHAAR_BACK, fileUrl: data.aadhaarBackUrl });
      if (data.photoUrl) docsToInsert.push({ guestId: guest.id, documentType: DocumentType.PHOTO, fileUrl: data.photoUrl });
      if (data.signatureUrl) docsToInsert.push({ guestId: guest.id, documentType: DocumentType.SIGNATURE, fileUrl: data.signatureUrl });

      if (docsToInsert.length > 0) {
        await tx.guestDocument.createMany({ data: docsToInsert });
      }

      // Calculate days
      const arrival = new Date(data.arrivalDate);
      const checkout = new Date(data.expectedCheckoutDate);
      const numberOfDays = room.roomType === 'MONTHLY' ? 1 : Math.max(1, Math.ceil((checkout.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));

      const grandTotal = (calculatedRoomRent * numberOfDays) + (data.extraCharges || 0) - (data.discount || 0);

      // Create booking
      const booking = await tx.booking.create({
        data: {
          lodgeId,
          guestId: guest.id,
          roomId: data.roomId,
          arrivalDate: new Date(data.arrivalDate),
          arrivalTime: data.arrivalTime,
          expectedCheckoutDate: new Date(data.expectedCheckoutDate),
          expectedCheckoutTime: data.expectedCheckoutTime,
          numberOfDays,
          guestCount: totalGuests,
          baseRoomRent: basePrice,
          extraGuestCharge: extraGuestChargeTotalPerDay,
          roomRent: calculatedRoomRent,
          extraCharges: data.extraCharges || 0,
          discount: data.discount || 0,
          totalAmount: grandTotal,
          advanceAmount: data.advanceAmount || 0,
          remarks: data.bookingRemarks,
          status: BookingStatus.CHECKED_IN,
          createdBy: adminId,
          updatedBy: adminId,
        },
      });

      // Update room status to OCCUPIED
      await tx.room.update({
        where: { id: data.roomId },
        data: { status: RoomStatus.OCCUPIED, updatedBy: adminId },
      });

      return guest;
    });

    await logActivity(adminId, 'GUEST_CREATED', 'guest', result.id, `Guest ${data.name} checked into Room ${room.roomNumber}`);
    return this.getById(result.id);
  }

  async getAll(params: {
    page: number;
    limit: number;
    skip: number;
    lodgeId?: string;
    search?: string;
    status?: string;
    roomType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: Prisma.GuestWhereInput = {};

    if (params.lodgeId && params.lodgeId !== 'ALL') {
      where.lodgeId = params.lodgeId;
    }

    // Search across multiple fields
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { phone: { contains: params.search } },
        { aadhaarNumber: { contains: params.search } },
        { email: { contains: params.search } },
        {
          bookings: {
            some: {
              room: { roomNumber: { contains: params.search } },
            },
          },
        },
      ];
    }

    if (params.status) {
      where.bookings = {
        some: { status: params.status as BookingStatus },
      };
    }

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          lodge: true,
          bookings: {
            include: {
              room: true,
              lodge: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.guest.count({ where }),
    ]);

    return { guests, total };
  }

  async getById(id: string) {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        lodge: true,
        documents: true,
        bookings: {
          include: {
            room: true,
            lodge: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!guest) {
      throw Object.assign(new Error('Guest not found'), { statusCode: 404 });
    }

    return guest;
  }

  async update(id: string, data: UpdateGuestInput, adminId: string) {
    const guest = await prisma.guest.update({
      where: { id },
      data: {
        ...data,
        email: data.email || null,
        updatedBy: adminId,
      },
      include: {
        bookings: {
          include: { room: true },
          orderBy: { createdAt: 'desc' },
        },
        documents: true,
      },
    });

    await logActivity(adminId, 'GUEST_UPDATED', 'guest', id, `Guest ${guest.name} updated`);
    return guest;
  }

  async delete(id: string, adminId: string) {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { bookings: { include: { room: true } } },
    });

    if (!guest) {
      throw Object.assign(new Error('Guest not found'), { statusCode: 404 });
    }

    await prisma.$transaction(async (tx) => {
      for (const booking of guest.bookings) {
        if (booking.status === BookingStatus.CHECKED_IN) {
          await tx.room.update({
            where: { id: booking.roomId },
            data: { status: RoomStatus.AVAILABLE },
          });
        }
      }
      await tx.guest.delete({ where: { id } });
    });

    await logActivity(adminId, 'GUEST_DELETED', 'guest', id, `Guest ${guest.name} deleted`);
  }

  async checkout(bookingId: string, data: CheckoutInput, adminId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { guest: true, room: true },
      });

      if (!booking) {
        throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
      }

      if (booking.status === BookingStatus.CHECKED_OUT) {
        throw Object.assign(new Error('Guest already checked out'), { statusCode: 400 });
      }

      const arrival = new Date(booking.arrivalDate);
      const departure = new Date(data.departureDate);
      const numberOfDays = booking.room?.roomType === 'MONTHLY' ? 1 : Math.max(1, Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          departureDate: departure,
          departureTime: data.departureTime,
          numberOfDays,
          lateCheckoutCharges: data.lateCheckoutCharges,
          status: BookingStatus.CHECKED_OUT,
          updatedBy: adminId,
        },
      });

      await tx.room.update({
        where: { id: booking.roomId },
        data: { status: RoomStatus.CLEANING, updatedBy: adminId },
      });

      return updatedBooking;
    });

    await logActivity(adminId, 'GUEST_CHECKED_OUT', 'booking', bookingId, `Booking checked out`);
    return result;
  }
}

export const guestService = new GuestService();
