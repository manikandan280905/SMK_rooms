export const ROOM_TYPES = [
  { value: 'SINGLE', label: 'Single Room' },
  { value: 'DOUBLE', label: 'Double Room' },
  { value: 'TRIPLE', label: 'Triple Room' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'DELUXE', label: 'Deluxe Room' },
  { value: 'FAMILY', label: 'Family Room' },
] as const;

export const ROOM_STATUSES = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'OCCUPIED', label: 'Occupied', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'CLEANING', label: 'Cleaning', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { value: 'RESERVED', label: 'Reserved', color: 'bg-sky-100 text-sky-800 border-sky-300' },
] as const;

export const PAYMENT_STATUSES = [
  { value: 'PAID', label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'PENDING', label: 'Pending', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-amber-100 text-amber-800 border-amber-300' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI / QR' },
  { value: 'CARD', label: 'Credit / Debit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
] as const;

export const BOOKING_STATUSES = [
  { value: 'CHECKED_IN', label: 'Checked In', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'CHECKED_OUT', label: 'Checked Out', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-300' },
] as const;
