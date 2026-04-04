import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getBySubject(req: Request, res: Response) {
  try {
    const topics = await prisma.topic.findMany({
      where: { subjectId: req.params.subjectId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { questions: true, tests: true } } },
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, subjectId, description } = req.body;
    const topic = await prisma.topic.create({ data: { name, subjectId, description } });
    res.status(201).json(topic);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Topic already exists for this subject' });
    } else {
      res.status(500).json({ error: 'Failed to create topic' });
    }
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    const topic = await prisma.topic.update({ where: { id: req.params.id }, data: { name, description } });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await prisma.topic.delete({ where: { id: req.params.id } });
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
}
