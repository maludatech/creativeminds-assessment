import { proxyConfig, proxyBinance } from '../_lib/binanceProxy';

export const config = proxyConfig;

export default function handler(): Promise<Response> {
  return proxyBinance('exchangeInfo');
}
