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

### Posts
- `fetch_all_posts`: Fetches all posts from WordPress with optional filtering
- `fetch_post`: Fetches a specific post by ID
- `create_post`: Creates a new blog post
- `update_post`: Updates an existing blog post
- `delete_post`: Deletes a specific post by ID

### Pages
- `fetch_all_pages`: Fetches all pages with optional filtering
- `fetch_page`: Fetches a specific page by ID
- `create_page`: Creates a new page
- `update_page`: Updates an existing page
- `delete_page`: Deletes a specific page by ID

### Media
- `fetch_all_media`: Fetches all media items with optional filtering
- `fetch_media`: Fetches a specific media item by ID
- `create_media`: Creates a new media item (upload file)
- `update_media`: Updates existing media item metadata
- `delete_media`: Deletes a specific media item by ID

## Search and Filter Parameters

### Common Parameters
- `page`: Page number of results
- `per_page`: Number of items per page
- `search`: Search term
- `order`: Sort order ('asc' or 'desc')
- `orderby`: Sort field ('date', 'id', 'include', 'title', 'slug')
- `status`: Content status ('publish', 'future', 'draft', 'pending', 'private')

### Media-specific Parameters
- `media_type`: Filter by media type ('image', 'video', 'audio', 'application')
- `mime_type`: Filter by MIME type

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

## Examples

### Creating a new page
```json
{
  "title": "About Us",
  "content": "Welcome to our site!",
  "status": "publish",
  "parent": 0
}
```

### Uploading media
```json
{
  "file": "https://example.com/image.jpg",
  "title": "Featured Image",
  "alt_text": "A beautiful landscape"
}
```

## License

MIT

## Author

Kurt Seifried