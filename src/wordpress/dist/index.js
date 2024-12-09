#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SearchParamsSchema, CreatePostSchema, UpdatePostSchema, FetchPostSchema, DeletePostSchema, } from './schemas.js';
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
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }
        switch (request.params.name) {
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
