import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { targetRole: req.user!.role as any, targetUserId: null },
          { targetUserId: req.user!.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markRead(req: Request, res: Response) {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification' });
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { targetRole: req.user!.role as any, targetUserId: null },
          { targetUserId: req.user!.userId },
        ],
        read: false,
      },
      data: { read: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all' });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const count = await prisma.notification.count({
      where: {
        OR: [
          { targetRole: req.user!.role as any, targetUserId: null },
          { targetUserId: req.user!.userId },
        ],
        read: false,
      },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count' });
  }
}

// Helper to create notifications (used internally)
export async function createNotification(data: {
  type: string;
  title: string;
  message: string;
  targetRole: 'ADMIN' | 'STUDENT';
  targetUserId?: string;
}) {
  return prisma.notification.create({ data: data as any });
}
