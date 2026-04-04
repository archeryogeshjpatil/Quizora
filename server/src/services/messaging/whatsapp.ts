/**
 * WhatsApp Business API Integration — Architecture Ready
 *
 * INTEGRATION GUIDE:
 * ─────────────────
 * 1. Choose a provider: Twilio, Meta Cloud API, or 360dialog
 *
 * 2. For Twilio:
 *    npm install twilio
 *    Add to .env:
 *      WHATSAPP_TWILIO_SID=your-account-sid
 *      WHATSAPP_TWILIO_AUTH=your-auth-token
 *      WHATSAPP_FROM=whatsapp:+14155238886
 *
 * 3. Uncomment the Twilio implementation below
 *
 * 4. For Meta Cloud API:
 *    Add to .env:
 *      WHATSAPP_API_URL=https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages
 *      WHATSAPP_API_TOKEN=your-access-token
 *
 * COST: WhatsApp Business API is paid (per message).
 *       Twilio: ~$0.005-$0.05 per message depending on country.
 *       Meta Cloud API: First 1,000 conversations/month free.
 */

import { env } from '../../config/env';

interface ResultData {
  studentName: string;
  testName: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank?: number;
}

class WhatsAppService {
  isConfigured(): boolean {
    return !!(env.WHATSAPP_API_URL && env.WHATSAPP_API_TOKEN);
  }

  async sendResult(mobile: string, data: ResultData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('WhatsApp not configured — skipping dispatch for', mobile);
      return false;
    }

    // ─── TWILIO IMPLEMENTATION (uncomment when ready) ───
    // const twilio = require('twilio');
    // const client = twilio(env.WHATSAPP_TWILIO_SID, env.WHATSAPP_TWILIO_AUTH);
    // try {
    //   await client.messages.create({
    //     from: env.WHATSAPP_FROM || 'whatsapp:+14155238886',
    //     to: `whatsapp:+91${mobile}`,
    //     body: `📝 Quizora Result\n\nStudent: ${data.studentName}\nTest: ${data.testName}\nSubject: ${data.subject}\nScore: ${data.score}/${data.totalMarks} (${data.percentage}%)\n${data.rank ? `Rank: ${data.rank}\n` : ''}\nPowered by Archer Infotech`,
    //   });
    //   return true;
    // } catch (error: any) {
    //   console.error('WhatsApp Twilio error:', error.message);
    //   return false;
    // }

    // ─── META CLOUD API (uncomment when ready) ───
    // try {
    //   const response = await fetch(env.WHATSAPP_API_URL, {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       messaging_product: 'whatsapp',
    //       to: `91${mobile}`,
    //       type: 'text',
    //       text: {
    //         body: `📝 Quizora Result\n\nStudent: ${data.studentName}\nTest: ${data.testName}\nScore: ${data.score}/${data.totalMarks} (${data.percentage}%)\n\nPowered by Archer Infotech`,
    //       },
    //     }),
    //   });
    //   return response.ok;
    // } catch (error: any) {
    //   console.error('WhatsApp Meta API error:', error.message);
    //   return false;
    // }

    console.log(`WhatsApp dispatch to ${mobile}: ${data.testName} result (not configured)`);
    return false;
  }

  async checkNumberActive(mobile: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    // Implement number verification with your chosen provider
    return false;
  }
}

export const whatsappService = new WhatsAppService();
