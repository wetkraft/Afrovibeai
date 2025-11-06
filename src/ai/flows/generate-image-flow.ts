'use server';
/**
 * @fileOverview AI-powered image generation flow.
 *
 * - generateImage - A function that generates an image based on a text prompt.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A detailed prompt describing the desired album cover, including any text or artist names.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The generated image as a data URI.'
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    const finalPrompt = `You are an expert AI image generator specializing in creating high-quality, modern album covers. Your task is to generate an image that precisely matches the user's description.

User's description for the album cover:
"${input.prompt}"

CRITICAL INSTRUCTIONS:
1.  **Visual Only**: The generated image must be purely visual and contain absolutely no text, letters, words, or characters of any kind. The song title and artist name will be added on top of the image later.
2.  **No People**: DO NOT under any circumstances include any human faces, heads, or recognizable portraits. The artwork must be abstract, symbolic, or scenic. I strongly discourage showing human heads.
3.  **Artistic Quality**: The final image should be clean, high-quality, visually balanced, and suitable for a professional album cover. Adhere to modern design principles.
4.  **Accuracy**: Interpret the user's description as literally as possible to create an accurate visual representation.`;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: finalPrompt,
      config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ],
      },
    });
    
    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
