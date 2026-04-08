'use server';
/**
 * @fileOverview A flow for generating a fun, interesting insight about a given cryptocurrency.
 *
 * - getCryptoInsight - A function that returns a single, concise insight.
 * - CryptoInsightInput - The input type for the getCryptoInsight function.
 * - CryptoInsightOutput - The return type for the getCryptoInsight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CryptoInsightInputSchema = z.object({
  currency: z.enum(['AVAX', 'BTC']).describe('The cryptocurrency to get an insight for.'),
});
export type CryptoInsightInput = z.infer<typeof CryptoInsightInputSchema>;

const CryptoInsightOutputSchema = z.object({
  insight: z.string().describe('A single, interesting, and concise insight about the cryptocurrency. Max 1-2 sentences.'),
});
export type CryptoInsightOutput = z.infer<typeof CryptoInsightOutputSchema>;


export async function getCryptoInsight(input: CryptoInsightInput): Promise<CryptoInsightOutput> {
  return cryptoInsightFlow(input);
}

const cryptoInsightPrompt = ai.definePrompt({
  name: 'cryptoInsightPrompt',
  input: { schema: CryptoInsightInputSchema },
  output: { schema: CryptoInsightOutputSchema },
  prompt: `You are a cryptocurrency expert.
  
Provide a single, interesting, and concise insight about the following cryptocurrency: {{{currency}}}.

Keep the insight to a maximum of 1-2 sentences. Focus on a fun fact or a key feature.
`,
});


const cryptoInsightFlow = ai.defineFlow(
  {
    name: 'cryptoInsightFlow',
    inputSchema: CryptoInsightInputSchema,
    outputSchema: CryptoInsightOutputSchema,
  },
  async (input) => {
    const { output } = await cryptoInsightPrompt(input);
    return output!;
  }
);
