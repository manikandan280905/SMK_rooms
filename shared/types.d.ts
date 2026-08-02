export declare enum RoomStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    CLEANING = "CLEANING",
    MAINTENANCE = "MAINTENANCE",
    RESERVED = "RESERVED"
}
export declare enum RoomType {
    SINGLE = "SINGLE",
    DOUBLE = "DOUBLE",
    TRIPLE = "TRIPLE",
    SUITE = "SUITE",
    DELUXE = "DELUXE",
    FAMILY = "FAMILY"
}
export declare enum BookingStatus {
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    PAID = "PAID",
    PENDING = "PENDING",
    PARTIAL = "PARTIAL"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    UPI = "UPI",
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export declare enum DocumentType {
    AADHAAR_FRONT = "AADHAAR_FRONT",
    AADHAAR_BACK = "AADHAAR_BACK",
    PHOTO = "PHOTO",
    SIGNATURE = "SIGNATURE"
}
export declare enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare enum AdminRole {
    ADMIN = "ADMIN",
    STAFF = "STAFF"
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
    documents: GuestDocument[];
    bookings: Booking[];
}
export interface Room {
    id: string;
    roomNumber: string;
    roomType: RoomType;
    isAC: boolean;
    floor: number;
    price: number;
    status: RoomStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}
export interface Booking {
    id: string;
    guestId: string;
    roomId: string;
    arrivalDate: string;
    arrivalTime: string;
    expectedCheckoutDate: string;
    expectedCheckoutTime: string;
    departureDate: string | null;
    departureTime: string | null;
    numberOfDays: number;
    lateCheckoutCharges: number;
    roomRent: number;
    extraCharges: number;
    discount: number;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    guest?: Guest;
    room?: Room;
    payment?: Payment;
}
export interface Payment {
    id: string;
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
    todaysGuests: number;
    currentCheckIns: number;
    todaysCheckOuts: number;
    occupiedRooms: number;
    availableRooms: number;
    todaysRevenue: number;
    pendingPayments: number;
    recentCheckIns: Booking[];
    roomStatus: RoomStatusSummary[];
}
export interface RoomStatusSummary {
    status: RoomStatus;
    count: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    admin: Admin;
    accessToken: string;
}
export interface TokenPayload {
    adminId: string;
    email: string;
    role: AdminRole;
}
//# sourceMappingURL=types.d.ts.map