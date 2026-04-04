import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aiQuestionGenerator } from '../services/ai/questionGenerator';
import * as XLSX from 'xlsx';
import path from 'path';
import { env } from '../config/env';

const prisma = new PrismaClient();

export async function getAll(req: Request, res: Response) {
  try {
    const { subjectId, difficulty, type, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [questions, total] = await Promise.all([
      prisma.question.findMany({ where, skip, take: parseInt(limit as string), include: { subject: true }, orderBy: { createdAt: 'desc' } }),
      prisma.question.count({ where }),
    ]);
    res.json({ questions, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: { subject: true, options: true },
    });
    if (!question) { res.status(404).json({ error: 'Question not found' }); return; }
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
}

export async function getVersionHistory(req: Request, res: Response) {
  try {
    const versions = await prisma.questionVersion.findMany({
      where: { questionId: req.params.id },
      orderBy: { version: 'desc' },
    });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch version history' });
  }
}

export async function restoreVersion(req: Request, res: Response) {
  try {
    const { id, versionId } = req.params;
    const version = await prisma.questionVersion.findUnique({ where: { id: versionId } });
    if (!version || version.questionId !== id) {
      res.status(404).json({ error: 'Version not found' }); return;
    }

    const current = await prisma.question.findUnique({ where: { id } });
    if (!current) { res.status(404).json({ error: 'Question not found' }); return; }

    // Save current as a version first
    await prisma.questionVersion.create({
      data: {
        questionId: id,
        version: current.version,
        text: current.text,
        options: JSON.stringify(current.correctAnswers),
        correctAnswers: current.correctAnswers,
        marks: current.marks,
        difficulty: current.difficulty,
      },
    });

    // Restore
    const options = version.options ? JSON.parse(version.options) : [];
    const question = await prisma.question.update({
      where: { id },
      data: {
        text: version.text,
        correctAnswers: version.correctAnswers,
        marks: version.marks,
        difficulty: version.difficulty,
        version: current.version + 1,
      },
    });

    res.json({ message: `Restored to version ${version.version}`, question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore version' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { subjectId, type, difficulty, text, options, correctAnswers, marks, imageUrl, explanation } = req.body;
    const question = await prisma.question.create({
      data: {
        subjectId, type, difficulty, text, marks, imageUrl, explanation,
        options: { create: options },
        correctAnswers,
        version: 1,
      },
      include: { options: true },
    });
    // Save initial version
    await prisma.questionVersion.create({
      data: {
        questionId: question.id,
        version: 1,
        text, options: JSON.stringify(options), correctAnswers, marks, difficulty,
      },
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const existing = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Question not found' }); return; }

    const { text, options, correctAnswers, marks, difficulty, imageUrl, explanation } = req.body;
    const newVersion = existing.version + 1;

    // Save previous version
    await prisma.questionVersion.create({
      data: {
        questionId: existing.id,
        version: existing.version,
        text: existing.text,
        options: JSON.stringify(existing.correctAnswers),
        correctAnswers: existing.correctAnswers,
        marks: existing.marks,
        difficulty: existing.difficulty,
      },
    });

    // Update question
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: { text, correctAnswers, marks, difficulty, imageUrl, explanation, version: newVersion },
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
}

export async function bulkImport(req: Request, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const { subjectId, topicId } = req.body;
    if (!subjectId) { res.status(400).json({ error: 'Subject is required' }); return; }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header row
      try {
        const qText = row['Question Text'];
        const qType = (row['Question Type'] || 'MCQ').toUpperCase().replace(/[\s-]/g, '_');
        const diff = (row['Difficulty Level'] || 'MODERATE').toUpperCase().replace(/\s+/g, '_');
        const correct = (row['Correct Answer(s)'] || '').toString();
        const marks = parseFloat(row['Marks'] || '1');

        if (!qText) { errors.push(`Row ${rowNum}: Missing question text`); continue; }
        if (!correct) { errors.push(`Row ${rowNum}: Missing correct answer`); continue; }

        const validTypes = ['MCQ', 'MSQ', 'TRUE_FALSE', 'TF', 'MATCHING', 'ASSERTION_REASONING', 'AR'];
        const typeMap: Record<string, string> = { TF: 'TRUE_FALSE', AR: 'ASSERTION_REASONING' };
        const finalType = typeMap[qType] || qType;
        if (!validTypes.includes(qType) && !validTypes.includes(finalType)) {
          errors.push(`Row ${rowNum}: Invalid question type "${qType}"`);
          continue;
        }

        const options: { label: string; text: string }[] = [];
        for (const lbl of ['A', 'B', 'C', 'D', 'E']) {
          const optText = row[`Option ${lbl}`];
          if (optText) options.push({ label: lbl, text: String(optText) });
        }

        if (options.length < 2) { errors.push(`Row ${rowNum}: Need at least 2 options`); continue; }

        const correctAnswers = correct.split(',').map((a: string) => a.trim().toUpperCase());

        await prisma.question.create({
          data: {
            subjectId,
            topicId: topicId || null,
            type: finalType as any,
            difficulty: (['SIMPLE', 'MODERATE', 'HARD', 'VERY_HARD'].includes(diff) ? diff : 'MODERATE') as any,
            text: qText,
            marks,
            correctAnswers,
            explanation: row['Explanation'] || '',
            version: 1,
            options: { create: options },
          },
        });
        imported++;
      } catch (err: any) {
        errors.push(`Row ${rowNum}: ${err.message || 'Import error'}`);
      }
    }

    res.json({
      message: `Import complete: ${imported} imported, ${errors.length} failed`,
      imported,
      total: rows.length,
      errors,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error.message);
    res.status(500).json({ error: 'Bulk import failed: ' + error.message });
  }
}

export async function downloadTemplate(_req: Request, res: Response) {
  try {
    const headers = [
      'Question Text', 'Question Type', 'Difficulty Level', 'Subject Category',
      'Option A', 'Option B', 'Option C', 'Option D', 'Option E',
      'Correct Answer(s)', 'Marks', 'Explanation',
    ];
    const sampleRows = [
      {
        'Question Text': 'What is 2 + 2?',
        'Question Type': 'MCQ',
        'Difficulty Level': 'Simple',
        'Subject Category': 'Mathematics',
        'Option A': '3', 'Option B': '4', 'Option C': '5', 'Option D': '6', 'Option E': '',
        'Correct Answer(s)': 'B',
        'Marks': 1,
        'Explanation': '2 + 2 equals 4',
      },
      {
        'Question Text': 'Which are primary colors?',
        'Question Type': 'MSQ',
        'Difficulty Level': 'Moderate',
        'Subject Category': 'General Knowledge',
        'Option A': 'Red', 'Option B': 'Green', 'Option C': 'Blue', 'Option D': 'Yellow', 'Option E': '',
        'Correct Answer(s)': 'A,C',
        'Marks': 2,
        'Explanation': 'Red and Blue are primary colors',
      },
      {
        'Question Text': 'The Earth is flat.',
        'Question Type': 'TF',
        'Difficulty Level': 'Simple',
        'Subject Category': 'General Knowledge',
        'Option A': 'True', 'Option B': 'False', 'Option C': '', 'Option D': '', 'Option E': '',
        'Correct Answer(s)': 'B',
        'Marks': 1,
        'Explanation': 'The Earth is an oblate spheroid',
      },
    ];

    const workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

    // Set column widths
    ws['!cols'] = headers.map((h) => ({ wch: h === 'Question Text' ? 40 : h === 'Explanation' ? 30 : 15 }));

    XLSX.utils.book_append_sheet(workbook, ws, 'Questions');

    // Instructions sheet
    const instrWs = XLSX.utils.aoa_to_sheet([
      ['Quizora — Bulk Question Import Template'],
      [''],
      ['Instructions:'],
      ['1. Fill in your questions in the "Questions" sheet.'],
      ['2. Question Type: MCQ, MSQ, TF (True/False), MATCHING, AR (Assertion & Reasoning)'],
      ['3. Difficulty Level: Simple, Moderate, Hard, Very Hard'],
      ['4. Correct Answer(s): Single letter for MCQ/TF (e.g., B), comma-separated for MSQ (e.g., A,C)'],
      ['5. Option E is optional — use only if needed.'],
      ['6. Marks: numeric value (e.g., 1, 2, 0.5)'],
      ['7. Explanation is optional.'],
      ['8. Do not change column headers.'],
    ]);
    XLSX.utils.book_append_sheet(workbook, instrWs, 'Instructions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=quizora-question-template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate template' });
  }
}

export async function aiGenerate(req: Request, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const { subjectId, count, types, difficulty, difficultyDistribution, focusArea, language } = req.body;

    const questions = await aiQuestionGenerator.generate({
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      subjectId,
      count: parseInt(count || '10'),
      types: types ? JSON.parse(types) : ['MCQ'],
      difficulty: difficulty || 'MODERATE',
      difficultyDistribution: difficultyDistribution ? JSON.parse(difficultyDistribution) : undefined,
      focusArea,
      language,
    });

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'AI question generation failed' });
  }
}

export async function aiGenerateFromText(req: Request, res: Response) {
  try {
    const { text, subjectId, count, types, difficulty, language } = req.body;
    if (!text || text.trim().length < 10) {
      res.status(400).json({ error: 'Please provide topic text with at least 10 characters' });
      return;
    }

    const questions = await aiQuestionGenerator.generateFromText({
      text,
      subjectId,
      count: parseInt(count || '5'),
      types: types || ['MCQ'],
      difficulty: difficulty || 'MODERATE',
      language: language || 'English',
    });

    res.json({ questions });
  } catch (error: any) {
    console.error('AI text generation error:', error.message);
    res.status(500).json({ error: error.message || 'AI question generation failed' });
  }
}

export async function batchSave(req: Request, res: Response) {
  try {
    const { subjectId, questions } = req.body;
    if (!subjectId || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'Subject and questions are required' });
      return;
    }

    let saved = 0;
    for (const q of questions) {
      await prisma.question.create({
        data: {
          subjectId,
          type: q.type || 'MCQ',
          difficulty: q.difficulty || 'MODERATE',
          text: q.question || q.text,
          marks: q.marks || 1,
          correctAnswers: q.correctAnswers || [],
          explanation: q.explanation || '',
          version: 1,
          options: {
            create: (q.options || []).map((opt: any) => ({
              label: opt.label,
              text: opt.text,
            })),
          },
        },
      });
      saved++;
    }

    res.json({ message: `${saved} questions saved to question bank`, saved });
  } catch (error: any) {
    console.error('Batch save error:', error.message);
    res.status(500).json({ error: 'Failed to save questions to question bank' });
  }
}

export async function uploadQuestionImage(req: Request, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: 'No image uploaded' }); return; }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: 'Image upload failed' });
  }
}
