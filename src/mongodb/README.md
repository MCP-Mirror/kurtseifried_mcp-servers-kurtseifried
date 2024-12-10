# MongoDB MCP Server

This is a Model Context Protocol (MCP) server for MongoDB that allows Claude to interact with MongoDB databases.

## Prerequisites

1. MongoDB installed and running locally, or access to a MongoDB instance
2. Node.js 14.0.0 or higher
3. npm (Node Package Manager)
4. Claude Desktop with MCP support

## Installation

You can install the package either globally or use it directly via npx:

```bash
# Global installation
npm install -g mcp-server-mongodb

# Or use directly via npx (recommended)
npx -y mcp-server-mongodb
```

## Configuration

Add the following configuration to your Claude desktop config file (typically located at `~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-mongodb"
      ],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017",
        "MONGODB_DB": "claude_db"
      }
    }
  }
}
```

### Configuration Options

- `MONGODB_URI`: The connection URI for your MongoDB instance (default: "mongodb://localhost:27017")
- `MONGODB_DB`: The default database to use (default: "claude_db")

For authentication, you can use a full MongoDB connection string:
```
mongodb://username:password@localhost:27017
```

### Testing the Installation

You can test if the server is working correctly by running:

```bash
npx -y mcp-server-mongodb
```

Then enter the following JSON to test (including the curly braces):
```json
{"command": "health"}
```

You should see a response like:
```json
{"result":{"status":"ok","version":"0.1.0","defaultDb":"claude_db","uri":"mongodb://localhost:27017"}}
```

### Database Behavior

The server handles databases in the following ways:

1. Creates the default database specified in `MONGODB_DB` on startup if it doesn't exist
2. Automatically creates databases specified in operations if they don't exist
3. Creates collections on demand when they're first accessed

## Supported Operations

The server supports these MongoDB operations:

1. `health` - Check server health status
   ```json
   {"command": "health"}
   ```

2. `listDatabases` - List all available databases
   ```json
   {"command": "listDatabases"}
   ```

3. `listCollections` - List collections in a database
   ```json
   {
     "command": "listCollections",
     "dbName": "mydb"
   }
   ```

4. `createDocument` - Insert a new document
   ```json
   {
     "command": "createDocument",
     "dbName": "mydb",
     "collectionName": "users",
     "document": {"name": "John", "age": 30}
   }
   ```

5. `findDocuments` - Query documents
   ```json
   {
     "command": "findDocuments",
     "dbName": "mydb",
     "collectionName": "users",
     "query": {"age": {"$gt": 25}}
   }
   ```

6. `updateDocument` - Update a document
   ```json
   {
     "command": "updateDocument",
     "dbName": "mydb",
     "collectionName": "users",
     "id": "documentId",
     "update": {"$set": {"age": 31}}
   }
   ```

7. `deleteDocument` - Delete a document
   ```json
   {
     "command": "deleteDocument",
     "dbName": "mydb",
     "collectionName": "users",
     "id": "documentId"
   }
   ```

8. `aggregate` - Run aggregation pipeline
   ```json
   {
     "command": "aggregate",
     "dbName": "mydb",
     "collectionName": "users",
     "pipeline": [
       {"$match": {"age": {"$gt": 25}}},
       {"$group": {"_id": null, "avgAge": {"$avg": "$age"}}}
     ]
   }
   ```

9. `createIndex` - Create an index
   ```json
   {
     "command": "createIndex",
     "dbName": "mydb",
     "collectionName": "users",
     "keys": {"name": 1},
     "options": {"unique": true}
   }
   ```

10. `listIndexes` - List collection indexes
    ```json
    {
      "command": "listIndexes",
      "dbName": "mydb",
      "collectionName": "users"
    }
    ```

11. `dropCollection` - Delete a collection
    ```json
    {
      "command": "dropCollection",
      "dbName": "mydb",
      "collectionName": "users"
    }
    ```

## Development

To build and test the server locally:

```bash
# Clone the repository
git clone [repository-url]
cd mcp-server-mongodb

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Error Handling

The server implements comprehensive error handling:

- Connection errors cause server exit with status code 1
- Invalid commands or parameters return detailed error messages
- Database/collection errors are properly propagated
- Authentication failures are reported immediately
- Network errors are caught and reported
- Sensitive information (like credentials) is removed from error messages

## Troubleshooting

1. If Claude Desktop doesn't show MongoDB functions:
   - Verify your config file syntax
   - Ensure MongoDB is running locally
   - Restart Claude Desktop completely
   - Check Claude Desktop logs for MCP-related errors

2. If connection fails:
   - Verify MongoDB is running: `mongosh`
   - Check connection string
   - Verify network connectivity and port availability

## License

MIT