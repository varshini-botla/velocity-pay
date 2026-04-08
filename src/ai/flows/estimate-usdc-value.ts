// estimate-usdc-value.ts
'use server';
/**
 * @fileOverview Estimates the USDC value for a given amount of AVAX or BTC.
 *
 * - estimateUsdcValue - A function that estimates the USDC value.
 * - EstimateUsdcValueInput - The input type for the estimateUsdcValue function.
 * - EstimateUsdcValueOutput - The return type for the estimateUsdcValue function.
 */

import { z } from 'zod';

const EstimateUsdcValueInputSchema = z.object({
  amount: z.number().describe('The amount of the cryptocurrency.'),
  currency: z.enum(['AVAX', 'BTC']).describe('The currency to estimate in USDC.'),
});
export type EstimateUsdcValueInput = z.infer<typeof EstimateUsdcValueInputSchema>;

const EstimateUsdcValueOutputSchema = z.object({
  estimatedUsdc: z.number().describe('The estimated USDC value.'),
});
export type EstimateUsdcValueOutput = z.infer<typeof EstimateUsdcValueOutputSchema>;

// Helper function to fetch price from CoinGecko
async function fetchPrice(coinId: 'avalanche-2' | 'bitcoin'): Promise<number> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${coinId}`);
    }
    const data = await response.json();
    const price = data[coinId]?.usd;
    if (typeof price !== 'number') {
      throw new Error(`Invalid price data for ${coinId}`);
    }
    return price;
  } catch (error) {
    console.error(`Error fetching price from CoinGecko:`, error);
    // Return a default/stale price or handle error appropriately
    if (coinId === 'avalanche-2') return 45;
    if (coinId === 'bitcoin') return 95000;
    return 0;
  }
}

export async function estimateUsdcValue(input: EstimateUsdcValueInput): Promise<EstimateUsdcValueOutput> {
  const { amount, currency } = input;
  let price = 0;

  try {
    if (currency === 'AVAX') {
      price = await fetchPrice('avalanche-2');
    } else if (currency === 'BTC') {
      price = await fetchPrice('bitcoin');
    } else {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const estimatedUsdc = amount * price;
    return { estimatedUsdc };
  } catch (error) {
    console.error('Error in estimateUsdcValue:', error);
    // Fallback to a zero estimate on error to avoid breaking the client
    return { estimatedUsdc: 0 };
  }
}
