import { z } from 'zod';

// Basic MongoDB types
export const ObjectIdSchema = z.string();

export const DocumentSchema = z.record(z.any());

// Command base schema
const CommandBase = z.object({
  command: z.string()
});

// Database operation schemas
export const HealthCheckSchema = CommandBase.extend({
  command: z.literal('health')
});

export const ListDatabasesSchema = CommandBase.extend({
  command: z.literal('listDatabases')
});

export const ListCollectionsSchema = CommandBase.extend({
  command: z.literal('listCollections'),
  dbName: z.string()
});

// Collection operation schemas
export const CreateDocumentSchema = CommandBase.extend({
  command: z.literal('createDocument'),
  dbName: z.string(),
  collectionName: z.string(),
  document: DocumentSchema
});

export const FindDocumentsSchema = CommandBase.extend({
  command: z.literal('findDocuments'),
  dbName: z.string(),
  collectionName: z.string(),
  query: DocumentSchema.optional()
});

export const UpdateDocumentSchema = CommandBase.extend({
  command: z.literal('updateDocument'),
  dbName: z.string(),
  collectionName: z.string(),
  id: ObjectIdSchema,
  update: DocumentSchema
});

export const DeleteDocumentSchema = CommandBase.extend({
  command: z.literal('deleteDocument'),
  dbName: z.string(),
  collectionName: z.string(),
  id: ObjectIdSchema
});

export const AggregateSchema = CommandBase.extend({
  command: z.literal('aggregate'),
  dbName: z.string(),
  collectionName: z.string(),
  pipeline: z.array(DocumentSchema)
});

export const DropCollectionSchema = CommandBase.extend({
  command: z.literal('dropCollection'),
  dbName: z.string(),
  collectionName: z.string()
});

// Index operation schemas
export const CreateIndexSchema = CommandBase.extend({
  command: z.literal('createIndex'),
  dbName: z.string(),
  collectionName: z.string(),
  keys: DocumentSchema,
  options: z.record(z.any()).optional()
});

export const ListIndexesSchema = CommandBase.extend({
  command: z.literal('listIndexes'),
  dbName: z.string(),
  collectionName: z.string()
});

// Union of all command schemas
export const CommandSchema = z.discriminatedUnion('command', [
  HealthCheckSchema,
  ListDatabasesSchema,
  ListCollectionsSchema,
  CreateDocumentSchema,
  FindDocumentsSchema,
  UpdateDocumentSchema,
  DeleteDocumentSchema,
  AggregateSchema,
  DropCollectionSchema,
  CreateIndexSchema,
  ListIndexesSchema
]);

// Type exports
export type Command = z.infer<typeof CommandSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type ListDatabases = z.infer<typeof ListDatabasesSchema>;
export type ListCollections = z.infer<typeof ListCollectionsSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type FindDocuments = z.infer<typeof FindDocumentsSchema>;
export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;
export type DeleteDocument = z.infer<typeof DeleteDocumentSchema>;
export type Aggregate = z.infer<typeof AggregateSchema>;
export type DropCollection = z.infer<typeof DropCollectionSchema>;
export type CreateIndex = z.infer<typeof CreateIndexSchema>;
export type ListIndexes = z.infer<typeof ListIndexesSchema>;