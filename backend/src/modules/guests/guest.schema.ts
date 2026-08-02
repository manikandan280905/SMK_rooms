import { z } from 'zod';

export const createGuestSchema = z.object({
  lodgeId: z.string().optional().nullable(),
  // Guest Information
  name: z.string().min(1, 'Guest name is required').max(200),
  fatherName: z.string().max(200).optional().nullable(),
  address: z.string().min(1, 'Address is required').max(500),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  altPhone: z.string().max(15).optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  age: z.number().int().min(0).max(150),
  occupation: z.string().max(200).optional().nullable(),
  nationality: z.string().max(100).default('Indian'),
  purposeOfVisit: z.string().max(500).optional().nullable(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  vehicleNumber: z.string().max(20).optional().nullable(),
  emergencyContact: z.string().max(15).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  aadhaarNumber: z.string().max(12).optional().nullable(),
  passportNumber: z.string().max(20).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  internalNotes: z.string().max(1000).optional().nullable(),

  // Documents / Signature
  aadhaarFrontUrl: z.string().optional().nullable(),
  aadhaarBackUrl: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),

  // Booking Details
  roomId: z.string().min(1, 'Room is required'),
  arrivalDate: z.string().min(1, 'Arrival date is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  expectedCheckoutDate: z.string().min(1, 'Expected checkout date is required'),
  expectedCheckoutTime: z.string().min(1, 'Expected checkout time is required'),
  roomRent: z.number().min(0),
  extraCharges: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  advanceAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  bookingRemarks: z.string().max(500).optional().nullable(),
});

export const updateGuestSchema = z.object({
  lodgeId: z.string().optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  fatherName: z.string().max(200).optional().nullable(),
  address: z.string().min(1).max(500).optional(),
  phone: z.string().min(10).max(15).optional(),
  altPhone: z.string().max(15).optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  age: z.number().int().min(0).max(150).optional(),
  occupation: z.string().max(200).optional().nullable(),
  nationality: z.string().max(100).optional(),
  purposeOfVisit: z.string().max(500).optional().nullable(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  vehicleNumber: z.string().max(20).optional().nullable(),
  emergencyContact: z.string().max(15).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  aadhaarNumber: z.string().max(12).optional().nullable(),
  passportNumber: z.string().max(20).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable(),
  internalNotes: z.string().max(1000).optional().nullable(),
});

export const checkoutSchema = z.object({
  departureDate: z.string().min(1, 'Departure date is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  lateCheckoutCharges: z.number().min(0).default(0),
  additionalPayment: z.number().min(0).default(0),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
