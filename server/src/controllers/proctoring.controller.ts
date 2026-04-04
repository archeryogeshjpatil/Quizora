import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function uploadSnapshot(req: Request, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: 'No snapshot uploaded' }); return; }
    const { attemptId } = req.body;

    await prisma.proctoringSnapshot.create({
      data: {
        attemptId,
        imagePath: `/snapshots/${req.file.filename}`,
        capturedAt: new Date(),
      },
    });
    res.json({ message: 'Snapshot saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
}

export async function getSnapshots(req: Request, res: Response) {
  try {
    const snapshots = await prisma.proctoringSnapshot.findMany({
      where: {
        attempt: { testId: req.params.testId, studentId: req.params.studentId },
      },
      orderBy: { capturedAt: 'asc' },
    });
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
}

export async function getFlags(req: Request, res: Response) {
  try {
    const flags = await prisma.proctoringFlag.findMany({
      where: { attempt: { testId: req.params.testId } },
      include: { attempt: { include: { student: { select: { fullName: true, email: true } } } } },
    });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch proctoring flags' });
  }
}
