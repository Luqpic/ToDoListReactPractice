import { z } from "zod";

// Shared password policy. Lives in one place so signup and password-change
// can't drift apart — a weaker rule on one of them is a silent hole.
const strongPassword = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Sign-up form: the password policy above, plus a confirmation field that
// has to match it.
export const signupSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;

// Log-in deliberately does NOT reuse the sign-up password policy. Accounts
// created under an older, weaker rule still have to be able to sign in;
// enforcing today's policy here would lock them out before login() is even
// called. Whether the credential is correct is auth.ts's job.
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Profile details. An empty display name is allowed — it's what every new
// account starts with, and requiring one here would block avatar-only or
// bio-only saves.
export const ProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .refine((v) => v === "" || v.length >= 2, {
      message: "Name must be at least 2 characters long",
    })
    .refine((v) => v === "" || /^[a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+)*$/.test(v), {
      message: "Name can only contain letters, numbers and spaces",
    }),
  bio: z.string().max(100, "Bio cannot exceed 100 characters"),
  avatar: z.string(),
});

export type ProfileValues = z.infer<typeof ProfileSchema>;

// Password Change Schema
export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // without this the error lands on the form root, not the field
  });

export type PasswordChangeValues = z.infer<typeof PasswordChangeSchema>;
