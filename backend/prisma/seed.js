"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create default admin
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@smkrooms.com' },
        update: {},
        create: {
            email: 'admin@smkrooms.com',
            password: hashedPassword,
            name: 'Administrator',
            role: 'ADMIN',
        },
    });
    console.log(`✅ Admin created: ${admin.email}`);
    // Create sample rooms
    const rooms = [
        { roomNumber: '101', roomType: 'SINGLE', isAC: false, floor: 1, price: 800 },
        { roomNumber: '102', roomType: 'SINGLE', isAC: true, floor: 1, price: 1000 },
        { roomNumber: '103', roomType: 'DOUBLE', isAC: false, floor: 1, price: 1200 },
        { roomNumber: '104', roomType: 'DOUBLE', isAC: true, floor: 1, price: 1500 },
        { roomNumber: '201', roomType: 'DOUBLE', isAC: true, floor: 2, price: 1500 },
        { roomNumber: '202', roomType: 'TRIPLE', isAC: true, floor: 2, price: 2000 },
        { roomNumber: '203', roomType: 'DELUXE', isAC: true, floor: 2, price: 2500 },
        { roomNumber: '204', roomType: 'FAMILY', isAC: true, floor: 2, price: 3000 },
        { roomNumber: '301', roomType: 'SUITE', isAC: true, floor: 3, price: 4000 },
        { roomNumber: '302', roomType: 'SUITE', isAC: true, floor: 3, price: 5000 },
    ];
    for (const room of rooms) {
        await prisma.room.upsert({
            where: { roomNumber: room.roomNumber },
            update: {},
            create: {
                ...room,
                status: 'AVAILABLE',
                createdBy: admin.id,
                updatedBy: admin.id,
            },
        });
    }
    console.log(`✅ ${rooms.length} rooms created`);
    // Create default settings
    const defaultSettings = [
        { key: 'hotel_name', value: 'SMK Rooms' },
        { key: 'hotel_address', value: '' },
        { key: 'hotel_phone', value: '' },
        { key: 'hotel_email', value: '' },
        { key: 'gst_number', value: '' },
        { key: 'gst_rate', value: '12' },
        { key: 'default_checkout_time', value: '11:00' },
        { key: 'currency', value: 'INR' },
    ];
    for (const setting of defaultSettings) {
        await prisma.settings.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log(`✅ Default settings created`);
    console.log('🌱 Seeding complete!');
    console.log('\n📋 Default Login Credentials:');
    console.log('   Email:    admin@smkrooms.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Change this password immediately after first login!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map