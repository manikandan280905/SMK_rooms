import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding multi-lodge database...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
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

  // Create 3 Lodges
  const lodge1 = await prisma.lodge.upsert({
    where: { name: 'Lodge 1' },
    update: {},
    create: { name: 'Lodge 1', address: 'Building A, SMK Complex' },
  });

  const lodge2 = await prisma.lodge.upsert({
    where: { name: 'Lodge 2' },
    update: {},
    create: { name: 'Lodge 2', address: 'Building B, SMK Complex' },
  });

  const lodge3 = await prisma.lodge.upsert({
    where: { name: 'Lodge 3' },
    update: {},
    create: { name: 'Lodge 3', address: 'Building C, SMK Complex' },
  });

  console.log(`✅ 3 Lodges created: ${lodge1.name}, ${lodge2.name}, ${lodge3.name}`);

  // Seed Lodge 1 Rooms (Total 15)
  // 8 AC Rooms: ₹1600/day, max 2 guests, ₹200/extra guest
  // 7 Non-AC Rooms: ₹1000/day, max 2 guests, ₹100/extra guest
  const lodge1Rooms = [
    { roomNumber: '101', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '102', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '103', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '104', roomType: 'DOUBLE' as const, isAC: false, floor: 1, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '105', roomType: 'DOUBLE' as const, isAC: false, floor: 1, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '106', roomType: 'DOUBLE' as const, isAC: false, floor: 1, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '107', roomType: 'DOUBLE' as const, isAC: false, floor: 1, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '108', roomType: 'DOUBLE' as const, isAC: false, floor: 1, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '109', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '110', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '111', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '112', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '113', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '114', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '115', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
  ];

  for (const r of lodge1Rooms) {
    await prisma.room.upsert({
      where: { lodgeId_roomNumber: { lodgeId: lodge1.id, roomNumber: r.roomNumber } },
      update: r,
      create: { ...r, lodgeId: lodge1.id, status: 'AVAILABLE', createdBy: admin.id, updatedBy: admin.id },
    });
  }

  // Seed Lodge 2 Rooms (Total 16 rooms)
  // 6 AC Rooms: ₹1600/day, max 2 guests, ₹200/extra guest
  // 10 Non-AC Rooms: ₹1000/day, max 2 guests, ₹100/extra guest
  const lodge2Rooms = [
    { roomNumber: '201', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '202', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '203', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '204', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '205', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '206', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '208', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '209', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '210', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '211', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '212', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '213', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '214', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '215', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '216', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '217', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
  ];

  // Remove room 207 from Lodge 2 if it exists
  await prisma.room.deleteMany({
    where: { lodgeId: lodge2.id, roomNumber: '207' },
  });

  for (const r of lodge2Rooms) {
    await prisma.room.upsert({
      where: { lodgeId_roomNumber: { lodgeId: lodge2.id, roomNumber: r.roomNumber } },
      update: r,
      create: { ...r, lodgeId: lodge2.id, status: 'AVAILABLE', createdBy: admin.id, updatedBy: admin.id },
    });
  }

  // Seed Lodge 3 Rooms (Total 11)
  // 7 AC Rooms: ₹1600/day, max 2 guests, ₹200/extra guest
  // 4 Non-AC Rooms: ₹1000/day, max 2 guests, ₹100/extra guest
  const lodge3Rooms = [
    { roomNumber: '301', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '302', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '303', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '304', roomType: 'DOUBLE' as const, isAC: true, floor: 1, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '305', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '306', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '307', roomType: 'DOUBLE' as const, isAC: true, floor: 2, price: 1600, dailyPrice: 1600, maxOccupancy: 2, extraGuestCharge: 200 },
    { roomNumber: '308', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '309', roomType: 'DOUBLE' as const, isAC: false, floor: 2, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '310', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
    { roomNumber: '311', roomType: 'DOUBLE' as const, isAC: false, floor: 3, price: 1000, dailyPrice: 1000, maxOccupancy: 2, extraGuestCharge: 100 },
  ];

  for (const r of lodge3Rooms) {
    await prisma.room.upsert({
      where: { lodgeId_roomNumber: { lodgeId: lodge3.id, roomNumber: r.roomNumber } },
      update: r,
      create: { ...r, lodgeId: lodge3.id, status: 'AVAILABLE', createdBy: admin.id, updatedBy: admin.id },
    });
  }

  // Create default settings
  const defaultSettings = [
    { key: 'hotel_name', value: 'SMK Rooms' },
    { key: 'hotel_address', value: 'SMK Complex' },
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

  console.log(`✅ Seeded Lodge 1 (15 rooms), Lodge 2 (16 rooms), Lodge 3 (11 rooms)`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
