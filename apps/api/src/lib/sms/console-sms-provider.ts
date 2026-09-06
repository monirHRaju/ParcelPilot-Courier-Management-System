import { SmsProvider } from './sms-provider.interface.js';
import { logger } from '../logger.js';

export class ConsoleSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<void> {
    logger.info(`[SMS to ${phone}]: ${message}`);
  }
}
