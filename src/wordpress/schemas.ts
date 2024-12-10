import { z } from 'zod';

export const WordPressConfigSchema = z.object({
  siteUrl: z.string().url(),
  username: z.string(),
  password: z.string(),
});

// Shared schemas for common parameters
export const PaginationParamsSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
});

export const SearchParamsSchema = PaginationParamsSchema.extend({
  search: z.string().optional(),
  after: z.string().optional(),
  author: z.number().optional(),
  author_exclude: z.array(z.number()).optional(),
  before: z.string().optional(),
  exclude: z.array(z.number()).optional(),
  include: z.array(z.number()).optional(),
  offset: z.number().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  orderby: z.enum(['date', 'id', 'include', 'title', 'slug']).optional(),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
});

// Post Schemas
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

// Page Schemas
export const PageParamsSchema = SearchParamsSchema.extend({
  parent: z.number().optional(),
  parent_exclude: z.array(z.number()).optional(),
  menu_order: z.number().optional(),
  slug: z.string().optional(),
});

export const CreatePageSchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
  parent: z.number().optional(),
  menu_order: z.number().optional(),
  template: z.string().optional(),
});

export const UpdatePageSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
  parent: z.number().optional(),
  menu_order: z.number().optional(),
  template: z.string().optional(),
});

export const FetchPageSchema = z.object({
  id: z.number(),
});

export const DeletePageSchema = z.object({
  id: z.number(),
});

// Media Schemas
export const MediaParamsSchema = SearchParamsSchema.extend({
  media_type: z.enum(['image', 'video', 'audio', 'application']).optional(),
  mime_type: z.string().optional(),
  parent: z.number().optional(),
  parent_exclude: z.array(z.number()).optional(),
});

export const CreateMediaSchema = z.object({
  file: z.string(), // Base64 encoded file or URL
  title: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  alt_text: z.string().optional(),
  post: z.number().optional(), // Parent post ID
});

export const UpdateMediaSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  alt_text: z.string().optional(),
  post: z.number().optional(),
});

export const FetchMediaSchema = z.object({
  id: z.number(),
});

export const DeleteMediaSchema = z.object({
  id: z.number(),
  force: z.boolean().optional(), // Whether to bypass trash and force deletion
});

// Types
export type WordPressConfig = z.infer<typeof WordPressConfigSchema>;
export type SearchParams = z.infer<typeof SearchParamsSchema>;
export type PageParams = z.infer<typeof PageParamsSchema>;
export type MediaParams = z.infer<typeof MediaParamsSchema>;

export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type FetchPost = z.infer<typeof FetchPostSchema>;
export type DeletePost = z.infer<typeof DeletePostSchema>;

export type CreatePage = z.infer<typeof CreatePageSchema>;
export type UpdatePage = z.infer<typeof UpdatePageSchema>;
export type FetchPage = z.infer<typeof FetchPageSchema>;
export type DeletePage = z.infer<typeof DeletePageSchema>;

export type CreateMedia = z.infer<typeof CreateMediaSchema>;
export type UpdateMedia = z.infer<typeof UpdateMediaSchema>;
export type FetchMedia = z.infer<typeof FetchMediaSchema>;
export type DeleteMedia = z.infer<typeof DeleteMediaSchema>;