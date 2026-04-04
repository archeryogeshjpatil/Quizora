import Tesseract from 'tesseract.js';

class OCRService {
  async extractText(imagePath: string): Promise<string> {
    const result = await Tesseract.recognize(imagePath, 'eng+hin+mar', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });
    return result.data.text;
  }
}

export const ocrService = new OCRService();
