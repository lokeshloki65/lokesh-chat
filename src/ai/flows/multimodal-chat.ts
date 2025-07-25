'use server';

/**
 * @fileOverview A multimodal chat flow that can process text and images.
 *
 * - multimodalChat - A function that handles multimodal chat interactions.
 */

import {ai} from '@/ai/genkit';
import {
  MultimodalChatInput,
  MultimodalChatInputSchema,
  MultimodalChatOutput,
  MultimodalChatOutputSchema,
} from '@/ai/schemas/multimodal-chat';

export async function multimodalChat(input: MultimodalChatInput): Promise<MultimodalChatOutput> {
  return multimodalChatFlow(input);
}

const multimodalChatFlow = ai.defineFlow(
  {
    name: 'multimodalChatFlow',
    inputSchema: MultimodalChatInputSchema,
    outputSchema: MultimodalChatOutputSchema,
  },
  async (input) => {
    const prompt: any[] = [{ text: `You are a helpful chatbot. Answer the user's query to the best of your ability.
    
    User Query: ${input.query}` }];

    if (input.photoDataUri) {
      prompt.push({ media: { url: input.photoDataUri } });
    }
    
    const llmResponse = await ai.generate({
      prompt: prompt,
    });

    return { response: llmResponse.text };
  }
);
