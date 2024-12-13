#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import nodemailer, { type SendMailOptions } from 'nodemailer';
import { sendEmailArgsSchema, sendEmailToolSchema, type ServerConfig } from "./schema.js";

class EmailServer {
  private transporter: nodemailer.Transporter;
  private config: ServerConfig;
  private server: Server;

  constructor(config: ServerConfig) {
    this.config = config;
    
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: config.email_service,
      auth: {
        user: config.email_username,
        pass: config.email_password,
      },
    });

    // Initialize MCP server
    this.server = new Server({
      name: "nodemailer-kurtseifried",
      version: "1.0.0",
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: "send_email",
        description: "Send an email with optional attachments and generated content",
        inputSchema: sendEmailToolSchema
      }]
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "send_email") {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = sendEmailArgsSchema.parse(request.params.arguments);
      
      // Prepare email options
      const mailOptions: SendMailOptions = {
        from: this.config.email_from,
        to: args.to,
        subject: args.subject,
        html: args.message_content, // Allow HTML content
        text: args.message_content.replace(/<[^>]*>?/gm, ''), // Strip HTML for plaintext alternative
        attachments: [], // Initialize empty array for attachments
      };

      // Handle attachments
      if (args.attachments) {
        for (const attachment of args.attachments) {
          // Handle generated content if specified
          if (attachment.generateContent) {
            // Here we would normally implement the content generation logic
            // For now, just use a placeholder
            const generatedContent = "Generated content placeholder";
            if (mailOptions.attachments) {
              mailOptions.attachments.push({
                filename: attachment.filename,
                content: generatedContent,
                contentType: attachment.contentType || 'text/plain',
              });
            }
          } else {
            // Direct content attachment
            if (mailOptions.attachments) {
              mailOptions.attachments.push({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
              });
            }
          }
        }
      }

      try {
        await this.transporter.sendMail(mailOptions);
        return {
          content: [{
            type: "text",
            text: `Email sent successfully to ${args.to}`,
          }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Get configuration from environment variables
const config: ServerConfig = {
  email_service: process.env.EMAIL_SERVICE || '',
  email_from: process.env.EMAIL_FROM || '',
  email_username: process.env.EMAIL_USERNAME || '',
  email_password: process.env.EMAIL_PASSWORD || '',
};

// Validate config
if (!config.email_service || !config.email_from || !config.email_username || !config.email_password) {
  throw new Error('Missing required environment variables. Please set EMAIL_SERVICE, EMAIL_FROM, EMAIL_USERNAME, and EMAIL_PASSWORD');
}

// Start the server
const server = new EmailServer(config);
await server.start();