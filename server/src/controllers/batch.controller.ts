import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAll(_req: Request, res: Response) {
  try {
    const batches = await prisma.batch.findMany({
      include: { _count: { select: { students: true, tests: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        students: { include: { student: { select: { id: true, fullName: true, email: true, mobile: true, status: true } } } },
        tests: { include: { test: { select: { id: true, title: true, type: true, subject: { select: { name: true } } } } } },
        _count: { select: { students: true, tests: true } },
      },
    });
    if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const batch = await prisma.batch.create({ data: { name, description } });
    res.status(201).json(batch);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Batch name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create batch' });
    }
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const batch = await prisma.batch.update({ where: { id: req.params.id }, data: { name, description } });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update batch' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await prisma.batch.delete({ where: { id: req.params.id } });
    res.json({ message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete batch' });
  }
}

// Add students to batch
export async function addStudents(req: Request, res: Response) {
  try {
    const { studentIds } = req.body;
    const batchId = req.params.id;

    const existing = await prisma.batchStudent.findMany({
      where: { batchId, studentId: { in: studentIds } },
      select: { studentId: true },
    });
    const existingIds = new Set(existing.map((e) => e.studentId));
    const newIds = studentIds.filter((id: string) => !existingIds.has(id));

    if (newIds.length > 0) {
      await prisma.batchStudent.createMany({
        data: newIds.map((studentId: string) => ({ batchId, studentId })),
      });
    }

    res.json({ message: `${newIds.length} students added`, added: newIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add students' });
  }
}

// Remove student from batch
export async function removeStudent(req: Request, res: Response) {
  try {
    await prisma.batchStudent.deleteMany({
      where: { batchId: req.params.id, studentId: req.params.studentId },
    });
    res.json({ message: 'Student removed from batch' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove student' });
  }
}

// Assign tests to batch
export async function assignTests(req: Request, res: Response) {
  try {
    const { testIds } = req.body;
    const batchId = req.params.id;

    const existing = await prisma.batchTest.findMany({
      where: { batchId, testId: { in: testIds } },
      select: { testId: true },
    });
    const existingIds = new Set(existing.map((e) => e.testId));
    const newIds = testIds.filter((id: string) => !existingIds.has(id));

    if (newIds.length > 0) {
      await prisma.batchTest.createMany({
        data: newIds.map((testId: string) => ({ batchId, testId })),
      });
    }

    res.json({ message: `${newIds.length} tests assigned`, assigned: newIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign tests' });
  }
}

// Remove test from batch
export async function removeTest(req: Request, res: Response) {
  try {
    await prisma.batchTest.deleteMany({
      where: { batchId: req.params.id, testId: req.params.testId },
    });
    res.json({ message: 'Test removed from batch' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove test' });
  }
}
