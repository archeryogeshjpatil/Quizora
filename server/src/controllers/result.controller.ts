import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function getMyResults(req: Request, res: Response) {
  try {
    const results = await prisma.testAttempt.findMany({
      where: { studentId: req.user!.userId, status: 'COMPLETED' },
      include: { test: { include: { subject: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
}

export async function getResultDetail(req: Request, res: Response) {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: req.params.attemptId },
      include: { test: { include: { subject: true, questions: { include: { question: { include: { options: true } } } } } } },
    });
    if (!attempt) { res.status(404).json({ error: 'Result not found' }); return; }
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch result detail' });
  }
}

export async function getTestResults(req: Request, res: Response) {
  try {
    const results = await prisma.testAttempt.findMany({
      where: { testId: req.params.testId, status: 'COMPLETED' },
      include: { student: { select: { id: true, fullName: true, email: true, mobile: true } } },
      orderBy: { score: 'desc' },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
}

export async function exportPdf(req: Request, res: Response) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.testId },
      include: { subject: true },
    });
    if (!test) { res.status(404).json({ error: 'Test not found' }); return; }

    const results = await prisma.testAttempt.findMany({
      where: { testId: req.params.testId, status: 'COMPLETED' },
      include: { student: { select: { fullName: true, email: true, mobile: true } } },
      orderBy: { score: 'desc' },
    });

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-Disposition', `attachment; filename=results-${test.title.replace(/\s+/g, '-')}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.fontSize(18).fillColor('#1a365d').text('Quizora — Result Sheet', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text('Powered by Archer Infotech', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#000').text(test.title, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Subject: ${test.subject?.name || '—'} | Total Marks: ${test.totalMarks} | Students: ${results.length}`, { align: 'center' });
    doc.moveDown(1);

    // Table header
    const startX = 40;
    let y = doc.y;
    doc.fontSize(9).fillColor('#fff');
    doc.rect(startX, y, 515, 20).fill('#1a365d');
    doc.text('Rank', startX + 5, y + 5, { width: 35 });
    doc.text('Name', startX + 45, y + 5, { width: 130 });
    doc.text('Email', startX + 180, y + 5, { width: 130 });
    doc.text('Score', startX + 315, y + 5, { width: 50 });
    doc.text('%', startX + 370, y + 5, { width: 40 });
    doc.text('Time', startX + 415, y + 5, { width: 50 });
    doc.text('Date', startX + 465, y + 5, { width: 50 });
    y += 22;

    // Table rows
    doc.fillColor('#000');
    results.forEach((r, i) => {
      if (y > 750) { doc.addPage(); y = 40; }
      const bg = i % 2 === 0 ? '#f7f7f7' : '#fff';
      doc.rect(startX, y, 515, 18).fill(bg);
      doc.fillColor('#333').fontSize(8);
      doc.text(String(i + 1), startX + 5, y + 4, { width: 35 });
      doc.text(r.student?.fullName || '—', startX + 45, y + 4, { width: 130 });
      doc.text(r.student?.email || '—', startX + 180, y + 4, { width: 130 });
      doc.text(`${r.score ?? '—'}/${r.totalMarks ?? '—'}`, startX + 315, y + 4, { width: 50 });
      doc.text(`${r.percentage ?? '—'}%`, startX + 370, y + 4, { width: 40 });
      const mins = r.timeTaken ? `${Math.floor(r.timeTaken / 60)}m` : '—';
      doc.text(mins, startX + 415, y + 4, { width: 50 });
      doc.text(r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '—', startX + 465, y + 4, { width: 50 });
      y += 18;
    });

    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
}

export async function exportExcel(req: Request, res: Response) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.testId },
      include: { subject: true },
    });
    if (!test) { res.status(404).json({ error: 'Test not found' }); return; }

    const results = await prisma.testAttempt.findMany({
      where: { testId: req.params.testId, status: 'COMPLETED' },
      include: { student: { select: { fullName: true, email: true, mobile: true } } },
      orderBy: { score: 'desc' },
    });

    const rows = results.map((r, i) => ({
      'Rank': i + 1,
      'Name': r.student?.fullName || '—',
      'Email': r.student?.email || '—',
      'Mobile': r.student?.mobile || '—',
      'Score': r.score ?? 0,
      'Total Marks': r.totalMarks ?? 0,
      'Percentage': r.percentage ?? 0,
      'Time (min)': r.timeTaken ? Math.round(r.timeTaken / 60) : 0,
      'Date': r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '—',
      'Status': r.status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
      { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename=results-${test.title.replace(/\s+/g, '-')}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
}

export async function dispatchResults(req: Request, res: Response) {
  try {
    const { testId, channels, studentIds } = req.body;
    // channels: ['EMAIL', 'TELEGRAM']
    // studentIds: string[] or null (all)

    const where: any = { testId, status: 'COMPLETED' };
    if (studentIds && studentIds.length > 0) where.studentId = { in: studentIds };

    const results = await prisma.testAttempt.findMany({
      where,
      include: {
        student: { select: { fullName: true, email: true, mobile: true } },
        test: { select: { title: true, subject: { select: { name: true } } } },
      },
    });

    let dispatched = 0;
    for (const r of results) {
      for (const channel of (channels || ['EMAIL'])) {
        await prisma.dispatchLog.create({
          data: {
            testId,
            studentId: r.studentId,
            channel,
            status: 'PENDING',
          },
        });
        // In production: queue the actual email/telegram send via BullMQ
        dispatched++;
      }
    }

    res.json({ message: `Dispatch queued for ${results.length} students via ${channels?.join(', ')}`, dispatched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dispatch results' });
  }
}

export async function scheduleDispatch(req: Request, res: Response) {
  try {
    const { testId, channels, studentIds, scheduledAt } = req.body;

    const where: any = { testId, status: 'COMPLETED' };
    if (studentIds && studentIds.length > 0) where.studentId = { in: studentIds };

    const results = await prisma.testAttempt.findMany({ where, select: { studentId: true } });

    for (const r of results) {
      for (const channel of (channels || ['EMAIL'])) {
        await prisma.dispatchLog.create({
          data: {
            testId,
            studentId: r.studentId,
            channel,
            status: 'SCHEDULED',
            scheduledAt: new Date(scheduledAt),
          },
        });
      }
    }

    res.json({ message: `Dispatch scheduled for ${new Date(scheduledAt).toLocaleString()}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule dispatch' });
  }
}

export async function getScheduledDispatches(req: Request, res: Response) {
  try {
    const dispatches = await prisma.dispatchLog.findMany({
      where: { status: { in: ['SCHEDULED', 'PENDING'] } },
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });
    res.json(dispatches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheduled dispatches' });
  }
}

export async function cancelScheduledDispatch(req: Request, res: Response) {
  try {
    await prisma.dispatchLog.delete({ where: { id: req.params.id } });
    res.json({ message: 'Dispatch cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel dispatch' });
  }
}
