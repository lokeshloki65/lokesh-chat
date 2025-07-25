'use server';

/**
 * @fileOverview This flow augments chatbot responses with relevant information from external sources based on the context of the user's query.
 *
 * - augmentChatbotWithData - A function that handles the augmentation of chatbot responses.
 * - AugmentChatbotWithDataInput - The input type for the augmentChatbotWithData function.
 * - AugmentChatbotWithDataOutput - The return type for the augmentChatbotWithData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AugmentChatbotWithDataInputSchema = z.object({
  query: z.string().describe('The user query to the chatbot.'),
});
export type AugmentChatbotWithDataInput = z.infer<typeof AugmentChatbotWithDataInputSchema>;

const AugmentChatbotWithDataOutputSchema = z.object({
  augmentedResponse: z.string().describe('The chatbot response augmented with external data.'),
});
export type AugmentChatbotWithDataOutput = z.infer<typeof AugmentChatbotWithDataOutputSchema>;

export async function augmentChatbotWithData(input: AugmentChatbotWithDataInput): Promise<AugmentChatbotWithDataOutput> {
  return augmentChatbotWithDataFlow(input);
}

const shouldIncludeDataTool = ai.defineTool({
  name: 'shouldIncludeData',
  description: 'Determine whether to include external data based on user query.',
  inputSchema: z.object({
    query: z.string().describe('The user query.'),
  }),
  outputSchema: z.boolean().describe('Whether to include external data (true) or not (false).'),
},
async (input) => {
    // This can call any typescript function.
    // For now, always return false.
    return false;
  }
);

const augmentChatbotWithDataPrompt = ai.definePrompt({
  name: 'augmentChatbotWithDataPrompt',
  input: {schema: AugmentChatbotWithDataInputSchema},
  output: {schema: AugmentChatbotWithDataOutputSchema},
  tools: [shouldIncludeDataTool],
  prompt: `You are a helpful chatbot.  Answer the user's query to the best of your ability.

  User Query: {{{query}}}

  {{#if (shouldIncludeData query)}}
  You have determined that including external data is necessary to provide a comprehensive answer.
  Include relevant links or documents to support your response.
  {{/if}}
  `,
});

const augmentChatbotWithDataFlow = ai.defineFlow(
  {
    name: 'augmentChatbotWithDataFlow',
    inputSchema: AugmentChatbotWithDataInputSchema,
    outputSchema: AugmentChatbotWithDataOutputSchema,
  },
  async input => {
    const {output} = await augmentChatbotWithDataPrompt(input);
    return output!;
  }
);
