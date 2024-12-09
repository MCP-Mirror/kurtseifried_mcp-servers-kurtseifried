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
