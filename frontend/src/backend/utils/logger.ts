import prisma from '../config/database';

export async function logActivity(
  adminId: string,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    // Don't throw — activity logging should never break the main flow
    console.error('Failed to log activity:', error);
  }
}
