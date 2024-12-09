# WordPress MCP Server

A Model Context Protocol server for interacting with WordPress sites through their REST API.

## Installation

```bash
npm install
npm run build
npm link
```

## Configuration

The server requires the following environment variables:

- `WORDPRESS_SITE_URL`: URL of your WordPress site (e.g., "https://example.com")
- `WORDPRESS_USERNAME`: WordPress username
- `WORDPRESS_PASSWORD`: WordPress application password

## Available Tools

- `fetch_all_posts`: Fetches all posts from WordPress with optional filtering
- `fetch_post`: Fetches a specific post by ID
- `create_post`: Creates a new blog post
- `update_post`: Updates an existing blog post
- `delete_post`: Deletes a specific post by ID

## Usage with Claude Desktop

Add this configuration to your Claude desktop config file:

```json
"wordpress": {
    "command": "mcp-server-wordpress",
    "env": {
        "WORDPRESS_SITE_URL": "your-site-url",
        "WORDPRESS_USERNAME": "your-username",
        "WORDPRESS_PASSWORD": "your-app-password"
    }
}
```

## Requirements

- Node.js 18+
- WordPress site with REST API enabled
- WordPress application password configured

## License

MIT

## Author

Kurt Seifried