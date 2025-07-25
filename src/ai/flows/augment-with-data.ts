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
  description: 'Determine whether to include external data based on user query. For example, if the user asks for links, documents, or external information.',
  inputSchema: z.object({
    query: z.string().describe('The user query.'),
  }),
  outputSchema: z.boolean().describe('Whether to include external data (true) or not (false).'),
},
async (input) => {
    // This is a placeholder. A real implementation would have logic
    // to determine if external data is needed.
    return /link|document|source/i.test(input.query);
  }
);


const augmentChatbotWithDataFlow = ai.defineFlow(
  {
    name: 'augmentChatbotWithDataFlow',
    inputSchema: AugmentChatbotWithDataInputSchema,
    outputSchema: AugmentChatbotWithDataOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `You are a helpful chatbot. Answer the user's query to the best of your ability.

      User Query: ${input.query}`,
      tools: [shouldIncludeDataTool],
    });

    const toolChoice = llmResponse.choices?.[0]?.toolCalls;

    if (toolChoice) {
      const toolResult = await ai.runTool(toolChoice[0]);
      if (toolResult.output) {
        const finalResponse = await ai.generate({
          prompt: `You are a helpful chatbot. You have determined that including external data is necessary to provide a comprehensive answer. Please include relevant links or documents to support your response to the user's query.
          
          User Query: ${input.query}`,
        });
        return { augmentedResponse: finalResponse.text };
      }
    }

    return { augmentedResponse: llmResponse.text };
  }
);
