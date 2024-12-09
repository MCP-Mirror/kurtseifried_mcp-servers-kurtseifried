import { z } from 'zod';

export const WordPressConfigSchema = z.object({
  siteUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
});

export const SearchParamsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  search: z.string().optional(),
});

export const CreatePostSchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
});

export const UpdatePostSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
});

export const FetchPostSchema = z.object({
  id: z.number(),
});

export const DeletePostSchema = z.object({
  id: z.number(),
});

// Types
export type WordPressConfig = z.infer<typeof WordPressConfigSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type FetchPost = z.infer<typeof FetchPostSchema>;
export type DeletePost = z.infer<typeof DeletePostSchema>;