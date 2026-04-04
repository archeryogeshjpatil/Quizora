import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function parseDocument(filePath: string, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      return parsePdf(filePath);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDocx(filePath);
    case 'text/plain':
      return parseTxt(filePath);
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return parsePptx(filePath);
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

async function parsePdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function parseTxt(filePath: string): Promise<string> {
  return fs.readFileSync(filePath, 'utf-8');
}

async function parsePptx(filePath: string): Promise<string> {
  // pptx-parser basic extraction
  try {
    const PptxParser = require('pptx-parser');
    const parser = new PptxParser();
    const slides = await parser.parse(filePath);
    return slides.map((slide: any) => slide.text || '').join('\n\n');
  } catch {
    throw new Error('Failed to parse PowerPoint file');
  }
}
