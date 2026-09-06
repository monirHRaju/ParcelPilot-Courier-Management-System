import { env } from '../../config/env.js';
import { SmsProvider } from './sms-provider.interface.js';
import { ConsoleSmsProvider } from './console-sms-provider.js';
import { BulkSmsBdProvider } from './bulksmsbd-provider.js';

export * from './sms-provider.interface.js';

let provider: SmsProvider;

if (env.SMS_PROVIDER === 'bulksmsbd') {
  if (!env.SMS_TOKEN) {
    throw new Error('SMS_TOKEN is required when SMS_PROVIDER is bulksmsbd');
  }
  provider = new BulkSmsBdProvider(env.SMS_TOKEN);
} else {
  provider = new ConsoleSmsProvider();
}

export const smsProvider = provider;
