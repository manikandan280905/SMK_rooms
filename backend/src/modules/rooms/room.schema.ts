import { z } from 'zod';

export const createRoomSchema = z.object({
  lodgeId: z.string().min(1, 'Lodge is required'),
  roomNumber: z.string().min(1, 'Room number is required').max(10),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'SUITE', 'DELUXE', 'FAMILY', 'MONTHLY']).default('DOUBLE'),
  isAC: z.boolean().default(false),
  floor: z.number().int().min(0).default(0),
  price: z.number().min(0, 'Price must be positive'),
  dailyPrice: z.number().min(0).optional().nullable(),
  monthlyPrice: z.number().min(0).optional().nullable(),
  maxOccupancy: z.number().int().min(1).default(2),
  extraGuestCharge: z.number().min(0).default(0),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
