'use server';
import 'dotenv/config';

import { generateImage } from '@/ai/flows/generate-image-flow';
import { editImage } from '@/ai/flows/edit-image-flow';
import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string(),
});

export async function generateImageFromPrompt(
  input: z.infer<typeof GenerateImageInputSchema>
) {
  const parsedInput = GenerateImageInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Invalid input', imageUrl: null };
  }

  try {
    const result = await generateImage(parsedInput.data);
    return { imageUrl: result.imageUrl, error: null };
  } catch (e: any) {
    console.error(e);
    return {
      error: e.message || 'Failed to generate image from AI.',
      imageUrl: null,
    };
  }
}

const EditImageInputSchema = z.object({
  prompt: z.string(),
  baseImageUrl: z.string(),
});

export async function editImageFromPrompt(
  input: z.infer<typeof EditImageInputSchema>
) {
  const parsedInput = EditImageInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Invalid input', imageUrl: null };
  }

  try {
    const result = await editImage(parsedInput.data);
    return { imageUrl: result.imageUrl, error: null };
  } catch (e: any) {
    console.error(e);
    return {
      error: e.message || 'Failed to edit image with AI.',
      imageUrl: null,
    };
  }
}
