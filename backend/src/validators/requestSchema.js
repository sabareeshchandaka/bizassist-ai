
import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters.")
      .optional(),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long.")
      .transform((value) => value.toLowerCase())
      .optional(),
  })
  .strict()
  .refine(
    (data) => data.name !== undefined || data.email !== undefined,
    {
      message: "Provide at least one field to update.",
    }
  );

// Change password
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required.")
      .max(128, "Current password is too long."),

    newPassword: z
      .string()
      .min(8, "New password must contain at least 8 characters.")
      .max(128, "New password cannot exceed 128 characters."),
  })
  .strict()
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from the current password.",
      path: ["newPassword"],
    }
  );

// MongoDB document ID validation
export const mongoIdSchema = z.object({
  id: z.string().regex(
    /^[a-f\d]{24}$/i,
    "Invalid resource ID."
  ),
});

// Registration validation
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  businessName: z
    .string()
    .trim()
    .min(2, "Business name must contain at least 2 characters.")
    .max(150, "Business name cannot exceed 150 characters."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254, "Email address is too long.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters."),
}).strict();

// Login validation
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254, "Email address is too long.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password cannot exceed 128 characters."),
}).strict();

// AI message validation
export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Please enter a message.")
    .max(4000, "Message cannot exceed 4000 characters."),

  conversationId: z.preprocess(
    (value) => value === "" || value === null ? undefined : value,
    z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Invalid conversation ID.")
      .optional()
  ),
}).strict();

// Conversation rename validation
export const renameConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Conversation title cannot be empty.")
    .max(100, "Title cannot exceed 100 characters."),
}).strict();

