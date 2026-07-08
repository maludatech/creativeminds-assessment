import { proxyBinance } from '../_lib/binanceProxy';

export const config = { regions: ['fra1'] };

export default function handler(): Promise<Response> {
  return proxyBinance('exchangeInfo');
}
