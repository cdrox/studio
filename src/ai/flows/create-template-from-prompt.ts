'use server';

/**
 * @fileOverview A flow to generate a template from a prompt describing the industry and data format.
 *
 * - createTemplateFromPrompt - A function that takes a prompt and returns a template.
 * - CreateTemplateFromPromptInput - The input type for the createTemplateFromPrompt function.
 * - CreateTemplateFromPromptOutput - The return type for the createTemplateFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateTemplateFromPromptInputSchema = z.string().describe('A prompt describing the industry and data format.');
export type CreateTemplateFromPromptInput = z.infer<typeof CreateTemplateFromPromptInputSchema>;

const CreateTemplateFromPromptOutputSchema = z.object({
  template: z.string().describe('The generated template.'),
});
export type CreateTemplateFromPromptOutput = z.infer<typeof CreateTemplateFromPromptOutputSchema>;

export async function createTemplateFromPrompt(input: CreateTemplateFromPromptInput): Promise<CreateTemplateFromPromptOutput> {
  return createTemplateFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createTemplateFromPromptPrompt',
  input: {schema: CreateTemplateFromPromptInputSchema},
  output: {schema: CreateTemplateFromPromptOutputSchema},
  prompt: `You are an expert template generator. You will generate a template based on the prompt provided. The template should be a string.

Prompt: {{{$input}}}`, // Changed to use Handlebars syntax
});

const createTemplateFromPromptFlow = ai.defineFlow(
  {
    name: 'createTemplateFromPromptFlow',
    inputSchema: CreateTemplateFromPromptInputSchema,
    outputSchema: CreateTemplateFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
