import { z } from "zod";

const PERSON_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u;
const PHONE_PATTERN = /^[0-9+().\-\s]+$/;
const PASSWORD_START_PATTERN = /^[A-Z]/;
const PASSWORD_NUMBER_PATTERN = /[0-9]/;

const personNameSchema = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(80, "Keep this name under 80 characters.")
  .regex(PERSON_NAME_PATTERN, "Use letters, spaces, apostrophes, or hyphens only.");

export const firstNameSchema = personNameSchema;
export const lastNameSchema = personNameSchema;
export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(25, "Enter a valid phone number.")
  .regex(PHONE_PATTERN, "Enter a valid phone number.");

export const accountPasswordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must contain no more than 128 characters.")
  .regex(PASSWORD_START_PATTERN, "Password must start with a capital letter.")
  .regex(PASSWORD_NUMBER_PATTERN, "Password must include at least one number.");

export const registrationSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.union([phoneSchema, z.literal("")]),
    password: accountPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegistrationValues = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Enter a valid password."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: accountPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
