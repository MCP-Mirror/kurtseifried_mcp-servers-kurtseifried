#!/usr/bin/env node

import { MongoClient, ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';
import { Command, CommandSchema } from './schemas.js';

interface MongoConfig {
  uri?: string;
  defaultDb?: string;
}

// Load config from Claude desktop config
function loadConfig(): MongoConfig {
    const configPath = join(homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
    try {
        const configFile = readFileSync(configPath, 'utf8');
        const config = JSON.parse(configFile);
        return config.mcpServers?.mongodb?.config || {};
    } catch (error) {
        console.error('Error loading config:', error);
        return {};
    }
}

const config = loadConfig();
const uri = config.uri || 'mongodb://localhost:27017';
const defaultDb = config.defaultDb || 'claude_db';
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB(): Promise<void> {
    try {
        await client.connect();
        console.error('Connected to MongoDB');
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
        console.log(JSON.stringify(response));
    } catch (error) {
        console.error('Error processing request:', error);
        console.log(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
    }
});

// Request handler
async function handleRequest(request: Command): Promise<unknown> {
    switch (request.command) {
        case 'health':
            return { status: 'ok' };

        case 'listDatabases': {
            const adminDb = client.db().admin();
            return await adminDb.listDatabases();
        }

        case 'listCollections': {
            const db = client.db(request.dbName);
            return await db.listCollections().toArray();
        }

        case 'createDocument': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            return await collection.insertOne(request.document);
        }

        case 'findDocuments': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            return await collection.find(request.query || {}).toArray();
        }

        case 'updateDocument': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            return await collection.updateOne(
                { _id: new ObjectId(request.id) },
                { $set: request.update }
            );
        }

        case 'deleteDocument': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            return await collection.deleteOne({ _id: new ObjectId(request.id) });
        }

        case 'aggregate': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            return await collection.aggregate(request.pipeline).toArray();
        }

        case 'createIndex': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            const indexName = await collection.createIndex(request.keys, request.options || {});
            return { indexName };
        }

        case 'listIndexes': {
            const db = client.db(request.dbName);
            const collection = db.collection(request.collectionName);
            return await collection.indexes();
        }

        case 'dropCollection': {
            const db = client.db(request.dbName);
            const result = await db.collection(request.collectionName).drop();
            return { dropped: result };
        }

        default: {
            const _exhaustiveCheck: never = request;
            throw new Error(`Unknown command: ${(request as any).command}`);
        }
    }
}
