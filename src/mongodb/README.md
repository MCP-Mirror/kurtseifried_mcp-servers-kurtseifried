# MongoDB MCP Server

This is a Model Context Protocol (MCP) server for MongoDB that allows Claude to interact with MongoDB databases.

## Installation

Make sure you have MongoDB installed and running locally, or have access to a MongoDB instance.

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
- `MONGODB_DB`: The default database to use (default: "claude_db"). If this database doesn't exist, it will be automatically created when the server starts or when it's first accessed.

### Database Creation

The server handles non-existent databases in the following ways:

1. On startup, it will automatically create the default database specified in `MONGODB_DB` if it doesn't exist
2. When operations target a specific database (via dbName parameter), that database will be automatically created if it doesn't exist
3. No error will be thrown for non-existent databases - they will be created on demand

## Supported Operations

The server supports the following MongoDB operations:

1. `health` - Check server health status
   - Returns server status, version, and configuration (with sensitive auth details removed)
   
2. `listDatabases` - List all available databases

3. `listCollections` - List all collections in a database
   - Creates the database if it doesn't exist

4. `createDocument` - Insert a new document into a collection
   - Creates both database and collection if they don't exist

5. `findDocuments` - Query documents in a collection
   - Creates database and collection if they don't exist
   - Returns empty array if collection is empty

6. `updateDocument` - Update an existing document
   - Creates database and collection if they don't exist
   - Returns zero matched/modified count if document not found

7. `deleteDocument` - Delete a document by ID
   - Creates database and collection if they don't exist
   - Returns zero deleted count if document not found

8. `aggregate` - Perform aggregation pipeline operations
   - Creates database and collection if they don't exist
   - Returns empty array if no results

9. `createIndex` - Create an index on a collection
   - Creates database and collection if they don't exist

10. `listIndexes` - List all indexes in a collection
    - Creates database and collection if they don't exist

11. `dropCollection` - Delete a collection
    - Creates database if it doesn't exist
    - Throws error if collection doesn't exist

## Development

To build the server locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Error Handling

The server implements graceful error handling:

- Connection errors will cause the server to exit with status code 1
- Invalid commands or parameters will return error messages
- Database/collection creation failures will propagate errors
- Authentication failures will be reported immediately
- Network errors will be caught and reported
- Sensitive information (like auth credentials) will be removed from error messages

## License

MIT