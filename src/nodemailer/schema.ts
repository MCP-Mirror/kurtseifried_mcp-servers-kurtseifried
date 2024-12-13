import { z } from "zod";

// Validation schema for email arguments
export const sendEmailArgsSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  message_content: z.string(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional(),
    generateContent: z.object({
      type: z.enum(["conversation_summary", "custom"]),
      parameters: z.object({
        format: z.enum(["markdown", "text", "json"]).optional(),
        style: z.string().optional(),
        custom_prompt: z.string().optional(),
      }).optional(),
    }).optional(),
  })).optional(),
});

// JSON Schema for tool definition
export const sendEmailToolSchema = {
  type: "object",
  properties: {
    to: {
      type: "string",
      format: "email",
      description: "Recipient email address",
    },
    subject: {
      type: "string",
      description: "Email subject line",
    },
    message_content: {
      type: "string",
      description: "Email content (can be text or HTML)",
    },
    attachments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          filename: { type: "string" },
          content: { type: "string" },
          contentType: { type: "string" },
          generateContent: {
            type: "object",
            properties: {
              type: { 
                type: "string",
                enum: ["conversation_summary", "custom"]
              },
              parameters: {
                type: "object",
                properties: {
                  format: {
                    type: "string",
                    enum: ["markdown", "text", "json"]
                  },
                  style: { type: "string" },
                  custom_prompt: { type: "string" }
                }
              }
            }
          }
        },
        required: ["filename"]
      }
    }
  },
  required: ["to", "subject", "message_content"]
} as const;

// Configuration type for the server
export type ServerConfig = {
  email_service: string;
  email_from: string;
  email_username: string;
  email_password: string;
};