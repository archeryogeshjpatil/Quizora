import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAll(req: Request, res: Response) {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const where: any = { role: 'STUDENT' };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { mobile: { contains: search as string } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit as string),
        select: { id: true, fullName: true, email: true, mobile: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, fullName: true, email: true, mobile: true, status: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Get attempt stats
    const [attempts, certificates, totalAttempts, avgScore] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { studentId: req.params.id, status: 'COMPLETED' },
        include: { test: { select: { title: true, type: true, subject: { select: { name: true } } } } },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      }),
      prisma.certificate.findMany({
        where: { studentId: req.params.id },
        include: { test: { select: { title: true } } },
      }),
      prisma.testAttempt.count({ where: { studentId: req.params.id, status: 'COMPLETED' } }),
      prisma.testAttempt.aggregate({
        where: { studentId: req.params.id, status: 'COMPLETED' },
        _avg: { percentage: true },
        _max: { percentage: true },
      }),
    ]);

    res.json({
      ...user,
      stats: {
        totalAttempts,
        avgPercentage: avgScore._avg.percentage ? Math.round(avgScore._avg.percentage) : null,
        bestPercentage: avgScore._max.percentage ? Math.round(avgScore._max.percentage) : null,
        certificatesEarned: certificates.length,
      },
      attempts,
      certificates,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function toggleStatus(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: newStatus },
      select: { id: true, fullName: true, status: true },
    });
    res.json({ message: `User ${newStatus.toLowerCase()}`, user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
}

export async function getUserAttempts(req: Request, res: Response) {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { studentId: req.params.id },
      include: { test: { select: { title: true, type: true, subject: { select: { name: true } } } } },
      orderBy: { startedAt: 'desc' },
    });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user attempts' });
  }
}
