import TelegramBot from 'node-telegram-bot-api';
import { env } from '../../config/env';

class TelegramService {
  private bot: TelegramBot | null = null;
  private initialized = false;

  private getBot(): TelegramBot | null {
    if (!env.TELEGRAM_BOT_TOKEN) {
      console.log('Telegram bot token not configured');
      return null;
    }
    if (!this.bot) {
      this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });
      this.initialized = true;
    }
    return this.bot;
  }

  isConfigured(): boolean {
    return !!env.TELEGRAM_BOT_TOKEN;
  }

  async sendResult(chatId: string, data: {
    studentName: string;
    testName: string;
    subject: string;
    score: number;
    totalMarks: number;
    percentage: number;
    rank?: number;
    certificateLink?: string;
  }): Promise<boolean> {
    const bot = this.getBot();
    if (!bot) return false;

    try {
      const message = [
        `📝 *Quizora — Exam Result*`,
        ``,
        `👤 Student: ${data.studentName}`,
        `📚 Test: ${data.testName}`,
        `📖 Subject: ${data.subject}`,
        `📊 Score: ${data.score} / ${data.totalMarks}`,
        `📈 Percentage: ${data.percentage}%`,
        data.rank ? `🏆 Rank: ${data.rank}` : '',
        data.certificateLink ? `\n📜 [Download Certificate](${data.certificateLink})` : '',
        ``,
        `_Powered by Archer Infotech_`,
      ].filter(Boolean).join('\n');

      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      return true;
    } catch (error: any) {
      console.error('Telegram send error:', error.message);
      return false;
    }
  }

  async sendNotification(chatId: string, title: string, message: string): Promise<boolean> {
    const bot = this.getBot();
    if (!bot) return false;

    try {
      await bot.sendMessage(chatId, `*${title}*\n\n${message}\n\n_Quizora — Powered by Archer Infotech_`, {
        parse_mode: 'Markdown',
      });
      return true;
    } catch (error: any) {
      console.error('Telegram notification error:', error.message);
      return false;
    }
  }

  async checkUserExists(chatId: string): Promise<boolean> {
    const bot = this.getBot();
    if (!bot) return false;
    try {
      await bot.getChat(chatId);
      return true;
    } catch {
      return false;
    }
  }
}

export const telegramService = new TelegramService();
