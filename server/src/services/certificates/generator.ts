import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';

interface CertificateData {
  studentName: string;
  testName: string;
  subject: string;
  score: number;
  percentage: number;
  completionDate: Date;
}

class CertificateGenerator {
  async generate(data: CertificateData): Promise<{ filePath: string; certificateId: string }> {
    const certificateId = `QUIZ-${uuidv4().slice(0, 8).toUpperCase()}`;
    const fileName = `${certificateId}.pdf`;
    const filePath = path.join(env.CERTIFICATES_DIR, fileName);

    // Ensure certificates directory exists
    if (!fs.existsSync(env.CERTIFICATES_DIR)) {
      fs.mkdirSync(env.CERTIFICATES_DIR, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#1a365d');
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke('#2b6cb0');

      // Header
      doc.fontSize(14).fillColor('#666').text('Powered by Archer Infotech', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(36).fillColor('#1a365d').text('QUIZORA', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(24).fillColor('#2b6cb0').text('Certificate of Achievement', { align: 'center' });
      doc.moveDown(1);

      // Divider
      doc.moveTo(150, doc.y).lineTo(doc.page.width - 150, doc.y).stroke('#ccc');
      doc.moveDown(1);

      // Body
      doc.fontSize(14).fillColor('#333').text('This is to certify that', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(28).fillColor('#1a365d').text(data.studentName, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('#333').text('has successfully completed the examination', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(20).fillColor('#2b6cb0').text(data.testName, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(14).fillColor('#333').text(`Subject: ${data.subject}`, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(14).text(`Score: ${data.score} | Percentage: ${data.percentage}%`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Date: ${data.completionDate.toLocaleDateString('en-IN')}`, { align: 'center' });
      doc.moveDown(1.5);

      // Certificate ID
      doc.fontSize(10).fillColor('#999').text(`Certificate ID: ${certificateId}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve({ filePath: fileName, certificateId }));
      stream.on('error', reject);
    });
  }
}

export const certificateGenerator = new CertificateGenerator();
