
'use server';
/**
 * @fileOverview AI-powered image editing flow.
 *
 * - editImage - A function that edits an image based on a base image and a text prompt.
 * - EditImageInput - The input type for the editImage function.
 * - EditImageOutput - The return type for the editImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditImageInputSchema = z.object({
  baseImageUrl: z
    .string()
    .describe(
      "The base image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('A detailed prompt describing the desired edits.'),
});
export type EditImageInput = z.infer<typeof EditImageInputSchema>;

const EditImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI.'),
});
export type EditImageOutput = z.infer<typeof EditImageOutputSchema>;

export async function editImage(input: EditImageInput): Promise<EditImageOutput> {
  return editImageFlow(input);
}

const editImageFlow = ai.defineFlow(
  {
    name: 'editImageFlow',
    inputSchema: EditImageInputSchema,
    outputSchema: EditImageOutputSchema,
  },
  async ({baseImageUrl, prompt}) => {
    const finalPrompt = `You are an expert AI image editor. Your task is to refine the provided image based on the user's instructions.

User's instructions for editing the image:
"${prompt}"

CRITICAL INSTRUCTIONS:
1.  **Visual Only**: The generated image must be purely visual and contain absolutely no text, letters, words, or characters of any kind.
2.  **No People**: DO NOT under any circumstances include any human faces, heads, or recognizable portraits.
3.  **Artistic Quality**: The final image should be clean, high-quality, and visually balanced.
4.  **Accuracy**: Interpret the user's instructions as literally as possible to apply the requested edits.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: baseImageUrl}},
        {text: finalPrompt},
      ],
    });

    if (!media.url) {
      throw new Error('Image editing failed to return a URL.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
