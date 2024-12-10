# MongoDB MCP Server

A Model Context Protocol server for interacting with MongoDB databases.

## Installation

1. Clone the MCP repository:
```bash
git clone https://github.com/kurtseifried/mcp-servers-kurtseifried.git
cd mcp-servers/src/mongodb
```

2. Install dependencies and build:
```bash
npm install        # Install dependencies
npm run build     # Compile TypeScript to JavaScript
npm link          # Make the mcp-server-mongodb command available globally
```

The `npm link` command creates a global symlink that makes the `mcp-server-mongodb` command available to Claude.

[Rest of README content remains the same...]