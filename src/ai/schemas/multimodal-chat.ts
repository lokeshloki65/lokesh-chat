import {z} from 'genkit';

export const MultimodalChatInputSchema = z.object({
  query: z.string().describe('The user query to the chatbot.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MultimodalChatInput = z.infer<typeof MultimodalChatInputSchema>;

export const MultimodalChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});
export type MultimodalChatOutput = z.infer<typeof MultimodalChatOutputSchema>;
