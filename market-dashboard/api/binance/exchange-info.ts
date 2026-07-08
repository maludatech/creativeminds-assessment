import { proxyBinance } from '../_lib/binanceProxy';

export const config = { regions: ['fra1'] };

export default async function handler(_req: unknown, res: any): Promise<void> {
  await proxyBinance(res, 'exchangeInfo');
}
