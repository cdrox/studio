'use server';
/**
 * @fileOverview This flow refines a narrative with an industry-specific tone.
 *
 * - refineNarrativeWithIndustryTone - A function that refines the narrative.
 * - RefineNarrativeInput - The input type for the refineNarrativeWithIndustryTone function.
 * - RefineNarrativeOutput - The return type for the refineNarrativeWithIndustryTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineNarrativeInputSchema = z.object({
  narrative: z.string().describe('The original narrative to refine.'),
  industry: z
    .enum(['healthcare', 'insurance', 'bfsi'])
    .describe('The industry to tailor the narrative to.'),
});
export type RefineNarrativeInput = z.infer<typeof RefineNarrativeInputSchema>;

const RefineNarrativeOutputSchema = z.object({
  refinedNarrative: z.string().describe('The refined narrative with industry-specific tone.'),
});
export type RefineNarrativeOutput = z.infer<typeof RefineNarrativeOutputSchema>;

export async function refineNarrativeWithIndustryTone(
  input: RefineNarrativeInput
): Promise<RefineNarrativeOutput> {
  return refineNarrativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineNarrativePrompt',
  input: {schema: RefineNarrativeInputSchema},
  output: {schema: RefineNarrativeOutputSchema},
  prompt: `You are an expert in tailoring narratives to specific industries.

  Original Narrative: {{{narrative}}}
  Industry: {{{industry}}}

  Please refine the above narrative to use language and terminology appropriate for the given industry.  The refined narrative should be accurate, professional, and suitable for stakeholders in the specified industry.
  `,
});

const refineNarrativeFlow = ai.defineFlow(
  {
    name: 'refineNarrativeFlow',
    inputSchema: RefineNarrativeInputSchema,
    outputSchema: RefineNarrativeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
