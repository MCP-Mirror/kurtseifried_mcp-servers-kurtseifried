#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { SearchParamsSchema, PageParamsSchema, MediaParamsSchema, CreatePostSchema, UpdatePostSchema, FetchPostSchema, DeletePostSchema, CreatePageSchema, UpdatePageSchema, FetchPageSchema, DeletePageSchema, CreateMediaSchema, UpdateMediaSchema, FetchMediaSchema, DeleteMediaSchema, } from './schemas.js';
const server = new Server({
    name: "wordpress-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Check for credentials
const WORDPRESS_SITE_URL = process.env.WORDPRESS_SITE_URL;
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD;
if (!WORDPRESS_SITE_URL || !WORDPRESS_USERNAME || !WORDPRESS_PASSWORD) {
    console.error("WordPress credentials not provided. Please set WORDPRESS_SITE_URL, WORDPRESS_USERNAME, and WORDPRESS_PASSWORD environment variables");
    process.exit(1);
}
class WordPressClient {
    constructor(config) {
        this.baseUrl = `${config.siteUrl.replace(/\/$/, '')}/wp-json/wp/v2`;
        this.client = axios.create({
            auth: {
                username: config.username,
                password: config.password
            },
            timeout: 10000
        });
    }
    // Posts methods
    async getAllPosts(params) {
        const response = await this.client.get(`${this.baseUrl}/posts`, { params });
        return response.data;
    }
    async getPost(id) {
        const response = await this.client.get(`${this.baseUrl}/posts/${id}`);
        return response.data;
    }
    async createPost(data) {
        const response = await this.client.post(`${this.baseUrl}/posts`, data);
        return response.data;
    }
    async updatePost(id, data) {
        const response = await this.client.put(`${this.baseUrl}/posts/${id}`, data);
        return response.data;
    }
    async deletePost(id) {
        await this.client.delete(`${this.baseUrl}/posts/${id}`);
    }
    // Pages methods
    async getAllPages(params) {
        const response = await this.client.get(`${this.baseUrl}/pages`, { params });
        return response.data;
    }
    async getPage(id) {
        const response = await this.client.get(`${this.baseUrl}/pages/${id}`);
        return response.data;
    }
    async createPage(data) {
        const response = await this.client.post(`${this.baseUrl}/pages`, data);
        return response.data;
    }
    async updatePage(id, data) {
        const response = await this.client.put(`${this.baseUrl}/pages/${id}`, data);
        return response.data;
    }
    async deletePage(id) {
        await this.client.delete(`${this.baseUrl}/pages/${id}`);
    }
    // Media methods
    async getAllMedia(params) {
        const response = await this.client.get(`${this.baseUrl}/media`, { params });
        return response.data;
    }
    async getMedia(id) {
        const response = await this.client.get(`${this.baseUrl}/media/${id}`);
        return response.data;
    }
    async createMedia(data) {
        let formData = new FormData();
        if (data.file.startsWith('http')) {
            // Download file from URL
            const response = await axios.get(data.file, { responseType: 'stream' });
            formData.append('file', response.data);
        }
        else if (data.file.startsWith('/')) {
            // Local file path
            formData.append('file', createReadStream(data.file));
        }
        else {
            // Base64 encoded file
            const buffer = Buffer.from(data.file.split(',')[1], 'base64');
            formData.append('file', buffer, {
                filename: 'upload.tmp',
                contentType: data.file.split(';')[0].split(':')[1],
            });
        }
        // Add metadata
        if (data.title)
            formData.append('title', data.title);
        if (data.caption)
            formData.append('caption', data.caption);
        if (data.description)
            formData.append('description', data.description);
        if (data.alt_text)
            formData.append('alt_text', data.alt_text);
        if (data.post)
            formData.append('post', data.post.toString());
        const response = await this.client.post(`${this.baseUrl}/media`, formData, {
            headers: { ...formData.getHeaders() }
        });
        return response.data;
    }
    async updateMedia(id, data) {
        const response = await this.client.put(`${this.baseUrl}/media/${id}`, data);
        return response.data;
    }
    async deleteMedia(id, force) {
        await this.client.delete(`${this.baseUrl}/media/${id}`, {
            params: { force }
        });
    }
}
// Initialize WordPress client
const wordpressClient = new WordPressClient({
    siteUrl: WORDPRESS_SITE_URL,
    username: WORDPRESS_USERNAME,
    password: WORDPRESS_PASSWORD,
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // Posts
            {
                name: "fetch_all_posts",
                description: "Fetches all posts from WordPress with optional filtering",
                inputSchema: zodToJsonSchema(SearchParamsSchema),
            },
            {
                name: "fetch_post",
                description: "Fetches a specific post by ID",
                inputSchema: zodToJsonSchema(FetchPostSchema),
            },
            {
                name: "create_post",
                description: "Creates a new blog post",
                inputSchema: zodToJsonSchema(CreatePostSchema),
            },
            {
                name: "update_post",
                description: "Updates an existing blog post",
                inputSchema: zodToJsonSchema(UpdatePostSchema),
            },
            {
                name: "delete_post",
                description: "Deletes a specific post by ID",
                inputSchema: zodToJsonSchema(DeletePostSchema),
            },
            // Pages
            {
                name: "fetch_all_pages",
                description: "Fetches all pages from WordPress with optional filtering",
                inputSchema: zodToJsonSchema(PageParamsSchema),
            },
            {
                name: "fetch_page",
                description: "Fetches a specific page by ID",
                inputSchema: zodToJsonSchema(FetchPageSchema),
            },
            {
                name: "create_page",
                description: "Creates a new page",
                inputSchema: zodToJsonSchema(CreatePageSchema),
            },
            {
                name: "update_page",
                description: "Updates an existing page",
                inputSchema: zodToJsonSchema(UpdatePageSchema),
            },
            {
                name: "delete_page",
                description: "Deletes a specific page by ID",
                inputSchema: zodToJsonSchema(DeletePageSchema),
            },
            // Media
            {
                name: "fetch_all_media",
                description: "Fetches all media items from WordPress with optional filtering",
                inputSchema: zodToJsonSchema(MediaParamsSchema),
            },
            {
                name: "fetch_media",
                description: "Fetches a specific media item by ID",
                inputSchema: zodToJsonSchema(FetchMediaSchema),
            },
            {
                name: "create_media",
                description: "Creates a new media item (upload file)",
                inputSchema: zodToJsonSchema(CreateMediaSchema),
            },
            {
                name: "update_media",
                description: "Updates an existing media item metadata",
                inputSchema: zodToJsonSchema(UpdateMediaSchema),
            },
            {
                name: "delete_media",
                description: "Deletes a specific media item by ID",
                inputSchema: zodToJsonSchema(DeleteMediaSchema),
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }
        switch (request.params.name) {
            // Posts handlers
            case "fetch_all_posts": {
                const args = SearchParamsSchema.parse(request.params.arguments);
                const posts = await wordpressClient.getAllPosts(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
                };
            }
            case "fetch_post": {
                const args = FetchPostSchema.parse(request.params.arguments);
                const post = await wordpressClient.getPost(args.id);
                return {
                    content: [{ type: "text", text: JSON.stringify(post, null, 2) }],
                };
            }
            case "create_post": {
                const args = CreatePostSchema.parse(request.params.arguments);
                const post = await wordpressClient.createPost(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(post, null, 2) }],
                };
            }
            case "update_post": {
                const args = UpdatePostSchema.parse(request.params.arguments);
                const { id, ...data } = args;
                const post = await wordpressClient.updatePost(id, data);
                return {
                    content: [{ type: "text", text: JSON.stringify(post, null, 2) }],
                };
            }
            case "delete_post": {
                const args = DeletePostSchema.parse(request.params.arguments);
                await wordpressClient.deletePost(args.id);
                return {
                    content: [{ type: "text", text: "Post deleted successfully" }],
                };
            }
            // Pages handlers
            case "fetch_all_pages": {
                const args = PageParamsSchema.parse(request.params.arguments);
                const pages = await wordpressClient.getAllPages(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(pages, null, 2) }],
                };
            }
            case "fetch_page": {
                const args = FetchPageSchema.parse(request.params.arguments);
                const page = await wordpressClient.getPage(args.id);
                return {
                    content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
                };
            }
            case "create_page": {
                const args = CreatePageSchema.parse(request.params.arguments);
                const page = await wordpressClient.createPage(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
                };
            }
            case "update_page": {
                const args = UpdatePageSchema.parse(request.params.arguments);
                const { id, ...data } = args;
                const page = await wordpressClient.updatePage(id, data);
                return {
                    content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
                };
            }
            case "delete_page": {
                const args = DeletePageSchema.parse(request.params.arguments);
                await wordpressClient.deletePage(args.id);
                return {
                    content: [{ type: "text", text: "Page deleted successfully" }],
                };
            }
            // Media handlers
            case "fetch_all_media": {
                const args = MediaParamsSchema.parse(request.params.arguments);
                const media = await wordpressClient.getAllMedia(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(media, null, 2) }],
                };
            }
            case "fetch_media": {
                const args = FetchMediaSchema.parse(request.params.arguments);
                const media = await wordpressClient.getMedia(args.id);
                return {
                    content: [{ type: "text", text: JSON.stringify(media, null, 2) }],
                };
            }
            case "create_media": {
                const args = CreateMediaSchema.parse(request.params.arguments);
                const media = await wordpressClient.createMedia(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(media, null, 2) }],
                };
            }
            case "update_media": {
                const args = UpdateMediaSchema.parse(request.params.arguments);
                const { id, ...data } = args;
                const media = await wordpressClient.updateMedia(id, data);
                return {
                    content: [{ type: "text", text: JSON.stringify(media, null, 2) }],
                };
            }
            case "delete_media": {
                const args = DeleteMediaSchema.parse(request.params.arguments);
                await wordpressClient.deleteMedia(args.id, args.force);
                return {
                    content: [{ type: "text", text: "Media deleted successfully" }],
                };
            }
            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid arguments: ${error.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ")}`);
        }
        throw error;
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("WordPress MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
