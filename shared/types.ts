// Shared TypeScript types and enums for SMK Rooms
// Used by both frontend and backend

// ─── Enums ───────────────────────────────────────────────

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
  SUITE = 'SUITE',
  DELUXE = 'DELUXE',
  FAMILY = 'FAMILY',
  MONTHLY = 'MONTHLY',
}

export enum BookingStatus {
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum DocumentType {
  AADHAAR_FRONT = 'AADHAAR_FRONT',
  AADHAAR_BACK = 'AADHAAR_BACK',
  PHOTO = 'PHOTO',
  SIGNATURE = 'SIGNATURE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum AdminRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

// ─── Interfaces ──────────────────────────────────────────

export interface Lodge {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  lodgeId: string | null;
  name: string;
  fatherName: string | null;
  address: string;
  phone: string;
  altPhone: string | null;
  gender: Gender;
  age: number;
  occupation: string | null;
  nationality: string;
  purposeOfVisit: string | null;
  adults: number;
  children: number;
  vehicleNumber: string | null;
  emergencyContact: string | null;
  email: string | null;
  aadhaarNumber: string | null;
  passportNumber: string | null;
  remarks: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  lodge?: Lodge;
  documents: GuestDocument[];
  bookings: Booking[];
}

export interface Room {
  id: string;
  lodgeId: string;
  roomNumber: string;
  roomType: RoomType;
  isAC: boolean;
  floor: number;
  price: number;
  dailyPrice: number | null;
  monthlyPrice: number | null;
  maxOccupancy: number;
  extraGuestCharge: number;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  lodge?: Lodge;
}

export interface Booking {
  id: string;
  lodgeId: string | null;
  guestId: string;
  roomId: string;
  arrivalDate: string;
  arrivalTime: string;
  expectedCheckoutDate: string;
  expectedCheckoutTime: string;
  departureDate: string | null;
  departureTime: string | null;
  numberOfDays: number;
  guestCount: number;
  baseRoomRent: number;
  extraGuestCharge: number;
  lateCheckoutCharges: number;
  roomRent: number;
  extraCharges: number;
  discount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  lodge?: Lodge;
  guest?: Guest;
  room?: Room;
  payment?: Payment;
}

export interface Payment {
  id: string;
  lodgeId: string | null;
  bookingId: string;
  advanceAmount: number;
  remainingBalance: number;
  totalAmount: number;
  gst: number;
  paymentMethod: PaymentMethod;
  transactionId: string | null;
  invoiceNumber: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  booking?: Booking;
}

export interface GuestDocument {
  id: string;
  guestId: string;
  documentType: DocumentType;
  fileUrl: string;
  cloudinaryPublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  admin?: Admin;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response Types ──────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardData {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  todaysGuests: number;
  currentCheckIns: number;
  todaysCheckOuts: number;
  todaysRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  recentCheckIns: Booking[];
  roomStatus: RoomStatusSummary[];
}

export interface RoomStatusSummary {
  status: RoomStatus;
  count: number;
}
