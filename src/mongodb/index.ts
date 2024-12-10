#!/usr/bin/env node

import { MongoClient, ObjectId } from 'mongodb';
import { createInterface } from 'readline';
import { Command, CommandSchema } from './schemas.js';

// Announce capabilities to Claude Desktop
console.log(JSON.stringify({
    functions: [
        {
            name: "mongodb_health",
            description: "Check MongoDB server health status",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        },
        {
            name: "mongodb_listDatabases",
            description: "List all available MongoDB databases",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        },
        {
            name: "mongodb_listCollections",
            description: "List all collections in a database",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" }
                },
                required: ["dbName"]
            }
        },
        {
            name: "mongodb_createDocument",
            description: "Create a new document in a collection",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" },
                    document: { type: "object", description: "Document to insert" }
                },
                required: ["dbName", "collectionName", "document"]
            }
        },
        {
            name: "mongodb_findDocuments",
            description: "Find documents in a collection",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" },
                    query: { type: "object", description: "Query filter" }
                },
                required: ["dbName", "collectionName"]
            }
        },
        {
            name: "mongodb_updateDocument",
            description: "Update an existing document",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" },
                    id: { type: "string", description: "Document ID" },
                    update: { type: "object", description: "Update operations" }
                },
                required: ["dbName", "collectionName", "id", "update"]
            }
        },
        {
            name: "mongodb_deleteDocument",
            description: "Delete a document",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" },
                    id: { type: "string", description: "Document ID" }
                },
                required: ["dbName", "collectionName", "id"]
            }
        },
        {
            name: "mongodb_aggregate",
            description: "Run an aggregation pipeline",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" },
                    pipeline: { 
                        type: "array", 
                        items: { type: "object" },
                        description: "Aggregation pipeline stages" 
                    }
                },
                required: ["dbName", "collectionName", "pipeline"]
            }
        },
        {
            name: "mongodb_createIndex",
            description: "Create an index on a collection",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" },
                    keys: { type: "object", description: "Index keys" },
                    options: { type: "object", description: "Index options" }
                },
                required: ["dbName", "collectionName", "keys"]
            }
        },
        {
            name: "mongodb_listIndexes",
            description: "List indexes for a collection",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" }
                },
                required: ["dbName", "collectionName"]
            }
        },
        {
            name: "mongodb_dropCollection",
            description: "Drop a collection",
            parameters: {
                type: "object",
                properties: {
                    dbName: { type: "string", description: "Database name" },
                    collectionName: { type: "string", description: "Collection name" }
                },
                required: ["dbName", "collectionName"]
            }
        }
    ]
}));

interface MongoConfig {
    uri: string;
    defaultDb: string;
}

// Get config from environment or use defaults
const config: MongoConfig = {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
    defaultDb: process.env.MONGODB_DB ?? 'claude_db'
};

const client = new MongoClient(config.uri);

// Connect to MongoDB and create default database if it doesn't exist
async function connectDB(): Promise<void> {
    try {
        await client.connect();
        console.error('Connected to MongoDB at', config.uri);
        
        // Creating a collection will create the database if it doesn't exist
        const db = client.db(config.defaultDb);
        await db.createCollection('_init');
        await db.collection('_init').drop().catch(() => {}); // Clean up initialization collection
        
        console.error(`Ensured database '${config.defaultDb}' exists`);
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

// Map function names to commands
function mapFunctionToCommand(name: string): string {
    return name.replace('mongodb_', '');
}

// Handle incoming messages
rl.on('line', async (line: string) => {
    try {
        const parsedRequest = JSON.parse(line);
        // Map function name to command name if needed
        if (parsedRequest.name && parsedRequest.name.startsWith('mongodb_')) {
            parsedRequest.command = mapFunctionToCommand(parsedRequest.name);
            delete parsedRequest.name;
            // Move parameters to top level
            if (parsedRequest.parameters) {
                Object.assign(parsedRequest, parsedRequest.parameters);
                delete parsedRequest.parameters;
            }
        }
        const request = CommandSchema.parse(parsedRequest);
        const response = await handleRequest(request);
        console.log(JSON.stringify({ result: response }));
    } catch (error) {
        console.error('Error processing request:', error);
        console.log(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }));
    }
});

// Ensure database exists
async function ensureDatabase(dbName: string): Promise<void> {
    const db = client.db(dbName);
    await db.createCollection('_init');
    await db.collection('_init').drop().catch(() => {});
}

// Type guard for commands that have dbName
function hasDbName(command: Command): command is Exclude<Command, { command: 'health' | 'listDatabases' }> {
    return 'dbName' in command;
}

// Request handler
async function handleRequest(request: Command): Promise<unknown> {
    // Only get dbName for commands that should have it
    const dbName = hasDbName(request) ? request.dbName : config.defaultDb;
    
    // For operations that need a database, ensure it exists first
    if (request.command !== 'health' && request.command !== 'listDatabases') {
        await ensureDatabase(dbName);
    }
    
    const db = client.db(dbName);
    
    switch (request.command) {
        case 'health':
            return { 
                status: 'ok', 
                version: '0.1.0',
                defaultDb: config.defaultDb,
                uri: config.uri.replace(/\/[^/]+:[^@]+@/, '***@') // Hide auth details if present
            };

        case 'listDatabases': {
            const adminDb = client.db().admin();
            const result = await adminDb.listDatabases();
            return result.databases;
        }

        case 'listCollections': {
            const collections = await db.listCollections().toArray();
            return collections.filter(col => col.name !== '_init');
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
