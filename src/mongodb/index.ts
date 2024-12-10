#!/usr/bin/env node

import { MongoClient, ObjectId } from 'mongodb';
import { createInterface } from 'readline';
import { Command, CommandSchema } from './schemas.js';

interface MongoConfig {
  uri?: string;
  defaultDb?: string;
}

// Get config from environment or use defaults
const config: MongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  defaultDb: process.env.MONGODB_DB || 'claude_db'
};

const client = new MongoClient(config.uri);

// Connect to MongoDB
async function connectDB(): Promise<void> {
    try {
        await client.connect();
        console.error('Connected to MongoDB at', config.uri);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Initialize connection
connectDB();

// Graceful shutdown
async function shutdown(): Promise<void> {
    try {
        await client.close();
        console.error('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Create readline interface
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// Handle incoming messages
rl.on('line', async (line: string) => {
    try {
        const parsedRequest = JSON.parse(line);
        const request = CommandSchema.parse(parsedRequest);
        const response = await handleRequest(request);
        console.log(JSON.stringify({ result: response }));
    } catch (error) {
        console.error('Error processing request:', error);
        console.log(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
    }
});

// Request handler
async function handleRequest(request: Command): Promise<unknown> {
    const db = client.db(request.dbName || config.defaultDb);
    
    switch (request.command) {
        case 'health':
            return { status: 'ok', version: '0.1.0' };

        case 'listDatabases': {
            const adminDb = client.db().admin();
            const result = await adminDb.listDatabases();
            return result.databases;
        }

        case 'listCollections': {
            return await db.listCollections().toArray();
        }

        case 'createDocument': {
            const collection = db.collection(request.collectionName);
            const result = await collection.insertOne(request.document);
            return { id: result.insertedId, acknowledged: result.acknowledged };
        }

        case 'findDocuments': {
            const collection = db.collection(request.collectionName);
            return await collection.find(request.query || {}).toArray();
        }

        case 'updateDocument': {
            const collection = db.collection(request.collectionName);
            const result = await collection.updateOne(
                { _id: new ObjectId(request.id) },
                { $set: request.update }
            );
            return { 
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                acknowledged: result.acknowledged
            };
        }

        case 'deleteDocument': {
            const collection = db.collection(request.collectionName);
            const result = await collection.deleteOne({ _id: new ObjectId(request.id) });
            return { 
                deletedCount: result.deletedCount,
                acknowledged: result.acknowledged
            };
        }

        case 'aggregate': {
            const collection = db.collection(request.collectionName);
            return await collection.aggregate(request.pipeline).toArray();
        }

        case 'createIndex': {
            const collection = db.collection(request.collectionName);
            const indexName = await collection.createIndex(request.keys, request.options || {});
            return { indexName };
        }

        case 'listIndexes': {
            const collection = db.collection(request.collectionName);
            return await collection.indexes();
        }

        case 'dropCollection': {
            const result = await db.collection(request.collectionName).drop();
            return { dropped: result };
        }

        default: {
            const _exhaustiveCheck: never = request;
            throw new Error(`Unknown command: ${(request as any).command}`);
        }
    }
}
