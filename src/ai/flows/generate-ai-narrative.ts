'use server';

/**
 * @fileOverview A flow that generates a natural language summary of key metrics,
 * identified anomalies, and potential root causes.
 *
 * - generateAINarrative - A function that generates the narrative.
 * - GenerateAINarrativeInput - The input type for the generateAINarrative function.
 * - GenerateAINarrativeOutput - The return type for the generateAINarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAINarrativeInputSchema = z.object({
  metricsSummary: z
    .string()
    .describe('A summary of the key metrics being analyzed.'),
  anomaliesSummary: z
    .string()
    .describe('A summary of the identified anomalies in the data.'),
  rootCausesSummary: z
    .string()
    .describe('A summary of the potential root causes of the anomalies.'),
  industry: z
    .string()
    .optional()
    .describe('The industry to tailor the narrative to.'),
});

export type GenerateAINarrativeInput = z.infer<typeof GenerateAINarrativeInputSchema>;

const GenerateAINarrativeOutputSchema = z.object({
  narrative: z
    .string()
    .describe('A natural language summary of the data insights.'),
});

export type GenerateAINarrativeOutput = z.infer<typeof GenerateAINarrativeOutputSchema>;

export async function generateAINarrative(input: GenerateAINarrativeInput): Promise<GenerateAINarrativeOutput> {
  return generateAINarrativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAINarrativePrompt',
  input: {schema: GenerateAINarrativeInputSchema},
  output: {schema: GenerateAINarrativeOutputSchema},
  prompt: `You are an AI assistant that generates natural language summaries of customer experience (CX) data.

You are provided with summaries of key metrics, identified anomalies, and potential root causes.

Based on this information, generate a concise and insightful narrative that tells the story behind the data.
{{#if industry}}
Tailor the narrative to the specified industry, using appropriate terminology and tone.
Industry: {{{industry}}}
{{/if}}

Metrics Summary: {{{metricsSummary}}}
Anomalies Summary: {{{anomaliesSummary}}}
Root Causes Summary: {{{rootCausesSummary}}}

Narrative:`,
});

const generateAINarrativeFlow = ai.defineFlow(
  {
    name: 'generateAINarrativeFlow',
    inputSchema: GenerateAINarrativeInputSchema,
    outputSchema: GenerateAINarrativeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
