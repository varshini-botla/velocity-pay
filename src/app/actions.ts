
'use server';

import { estimateUsdcValue, type EstimateUsdcValueInput } from '@/ai/flows/estimate-usdc-value';
import { getCryptoInsight, type CryptoInsightInput } from '@/ai/flows/crypto-insights-flow';

export async function getUsdcEstimate(data: EstimateUsdcValueInput): Promise<{ estimatedUsdc: number } | { error: string }> {
  try {
    const result = await estimateUsdcValue(data);
    return result;
  } catch (error) {
    console.error("Error estimating USDC value:", error);
    return { error: 'Failed to estimate USDC value.' };
  }
}

export async function fetchCryptoInsight(data: CryptoInsightInput): Promise<{ insight: string } | { error: string }> {
  try {
    const result = await getCryptoInsight(data);
    return result;
  } catch (error) {
    console.error("Error fetching crypto insight:", error);
    return { error: 'Failed to fetch crypto insight.' };
  }
}
