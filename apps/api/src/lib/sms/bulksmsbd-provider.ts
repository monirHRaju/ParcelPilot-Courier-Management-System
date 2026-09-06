import { SmsProvider } from './sms-provider.interface.js';
import { logger } from '../logger.js';
import { AppError } from '../../errors/app-error.js';

export class BulkSmsBdProvider implements SmsProvider {
  constructor(private readonly token: string) {}

  async send(phone: string, message: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('token', this.token);
      params.append('to', phone);
      params.append('message', message);

      const response = await fetch('http://api.greenweb.com.bd/api.php', {
        method: 'POST',
        body: params,
      });

      const data = await response.text();
      
      // Usually it returns something we can log or check, but for now we just log it
      logger.info({ data, phone }, 'BulkSmsBd response');
      
      if (!response.ok) {
        throw new Error(`BulkSmsBd API error: ${response.status} ${data}`);
      }
    } catch (error) {
      logger.error({ error, phone }, 'Failed to send SMS via BulkSmsBd');
      throw AppError.internal('Failed to send SMS', 'SMS_SEND_FAILED');
    }
  }
}
