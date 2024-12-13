import { jest } from '@jest/globals';
import nodemailer, { type SendMailOptions } from 'nodemailer';
import type { ServerConfig } from './schema.js';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailServer', () => {
  let mockTransporter: {
    // Define the mock type inline for clarity
    sendMail: jest.Mock<Promise<{ messageId: string }>, [SendMailOptions]>;
  };

  beforeEach(() => {
    // Setup environment variables for tests
    process.env.EMAIL_SERVICE = 'gmail';
    process.env.EMAIL_FROM = 'test@example.com';
    process.env.EMAIL_USERNAME = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'password123';

    // Create the mock with explicit typing
    const sendMailMock = jest.fn();
    sendMailMock.mockResolvedValue({ messageId: 'test-id' });

    mockTransporter = {
      sendMail: sendMailMock
    };
    
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test server initialization
  test('should initialize with correct configuration', () => {
    const config: ServerConfig = {
      email_service: 'gmail',
      email_from: 'test@example.com',
      email_username: 'test@example.com',
      email_password: 'password123',
    };

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: config.email_service,
      auth: {
        user: config.email_username,
        pass: config.email_password,
      },
    });
  });

  // Test email sending
  test('should send email with correct parameters', () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      message_content: 'Test Message',
    };

    mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'test@example.com',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.message_content,
      html: emailData.message_content,
    }));
  });

  // Test attachment handling
  test('should handle attachments correctly', () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      message_content: 'Test Message',
      attachments: [
        {
          filename: 'test.txt',
          content: 'Test content',
          contentType: 'text/plain',
        },
      ],
    };

    mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      attachments: expect.arrayContaining([
        expect.objectContaining({
          filename: 'test.txt',
          content: 'Test content',
          contentType: 'text/plain',
        }),
      ]),
    }));
  });

  // Test error handling
  test('should handle email sending errors', () => {
    const testError = new Error('Test error');
    mockTransporter.sendMail.mockRejectedValueOnce(testError);

    expect(mockTransporter.sendMail).toHaveBeenCalled();
  });

  // Test HTML content handling
  test('should handle HTML content correctly', () => {
    const emailData = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      message_content: '<h1>Test</h1><p>Message</p>',
    };

    mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      html: emailData.message_content,
      text: 'TestMessage', // HTML tags should be stripped
    }));
  });
});