import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAll(_req: Request, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const subject = await prisma.subject.findUnique({ where: { id: req.params.id } });
    if (!subject) { res.status(404).json({ error: 'Subject not found' }); return; }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const subject = await prisma.subject.create({ data: { name, description } });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const subject = await prisma.subject.update({ where: { id: req.params.id }, data: { name, description } });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
}
