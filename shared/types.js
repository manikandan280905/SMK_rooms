"use strict";
// Shared TypeScript types and enums for SMK Rooms
// Used by both frontend and backend
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRole = exports.Gender = exports.DocumentType = exports.PaymentMethod = exports.PaymentStatus = exports.BookingStatus = exports.RoomType = exports.RoomStatus = void 0;
// ─── Enums ───────────────────────────────────────────────
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["AVAILABLE"] = "AVAILABLE";
    RoomStatus["OCCUPIED"] = "OCCUPIED";
    RoomStatus["CLEANING"] = "CLEANING";
    RoomStatus["MAINTENANCE"] = "MAINTENANCE";
    RoomStatus["RESERVED"] = "RESERVED";
})(RoomStatus || (exports.RoomStatus = RoomStatus = {}));
var RoomType;
(function (RoomType) {
    RoomType["SINGLE"] = "SINGLE";
    RoomType["DOUBLE"] = "DOUBLE";
    RoomType["TRIPLE"] = "TRIPLE";
    RoomType["SUITE"] = "SUITE";
    RoomType["DELUXE"] = "DELUXE";
    RoomType["FAMILY"] = "FAMILY";
})(RoomType || (exports.RoomType = RoomType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["CHECKED_IN"] = "CHECKED_IN";
    BookingStatus["CHECKED_OUT"] = "CHECKED_OUT";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PARTIAL"] = "PARTIAL";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["AADHAAR_FRONT"] = "AADHAAR_FRONT";
    DocumentType["AADHAAR_BACK"] = "AADHAAR_BACK";
    DocumentType["PHOTO"] = "PHOTO";
    DocumentType["SIGNATURE"] = "SIGNATURE";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["ADMIN"] = "ADMIN";
    AdminRole["STAFF"] = "STAFF";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
//# sourceMappingURL=types.js.map