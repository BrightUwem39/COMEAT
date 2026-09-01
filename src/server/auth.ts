import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { after } from "next/server";

import {
  accountPasswordSchema,
  firstNameSchema,
  lastNameSchema,
  phoneSchema,
} from "@/lib/auth-validation";
import { db } from "@/server/db";
import { sendAuthEmail } from "@/server/auth-email";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const ONE_HOUR_IN_SECONDS = 60 * 60;
const LOCAL_AUTH_URL = "http://127.0.0.1:3000";

function getAuthBaseUrl() {
  const configuredUrl =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl && process.env.NODE_ENV === "production") {
    throw new Error(
      "BETTER_AUTH_URL or NEXT_PUBLIC_SITE_URL must be configured in production.",
    );
  }

  return configuredUrl || LOCAL_AUTH_URL;
}

function getAuthSecret() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();

  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error(
      "BETTER_AUTH_SECRET must contain at least 32 characters in production.",
    );
  }

  return secret;
}

const authBaseUrl = getAuthBaseUrl();
const trustedOrigins =
  process.env.NODE_ENV === "production"
    ? [authBaseUrl]
    : Array.from(
        new Set([
          authBaseUrl,
          "http://127.0.0.1:3000",
          "http://localhost:3000",
        ]),
      );

export const auth = betterAuth({
  appName: "ComEat",
  baseURL: authBaseUrl,
  secret: getAuthSecret(),
  trustedOrigins,
  database: prismaAdapter(db, {
    provider: "postgresql",
    transaction: true,
  }),
  hooks: {
    before: createAuthMiddleware(async (context) => {
      const body = context.body as
        | { newPassword?: unknown; password?: unknown }
        | undefined;
      const password =
        context.path === "/sign-up/email"
          ? body?.password
          : context.path === "/reset-password"
            ? body?.newPassword
            : undefined;

      if (typeof password !== "string") return;

      const result = accountPasswordSchema.safeParse(password);

      if (!result.success) {
        throw APIError.from("BAD_REQUEST", {
          code: "INVALID_PASSWORD_FORMAT",
          message:
            result.error.issues[0]?.message ??
            "Enter a password that meets all requirements.",
        });
      }
    }),
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: ONE_HOUR_IN_SECONDS,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        actionLabel: "Reset password",
        actionUrl: url,
        heading: "Reset your password",
        kind: "password-reset",
        message:
          "We received a request to reset your ComEat password. Use the secure link below within one hour.",
        subject: "Reset your ComEat password",
        to: user.email,
      });
    },
  },
  emailVerification: {
    expiresIn: ONE_DAY_IN_SECONDS,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        actionLabel: "Verify email",
        actionUrl: url,
        heading: "Verify your email",
        kind: "verification",
        message:
          "Confirm that this email belongs to you to finish securing your ComEat account. This link is valid for 24 hours.",
        subject: "Verify your ComEat email",
        to: user.email,
      });
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        validator: {
          input: firstNameSchema,
        },
      },
      lastName: {
        type: "string",
        required: true,
        validator: {
          input: lastNameSchema,
        },
      },
      phone: {
        type: "string",
        required: false,
        validator: {
          input: phoneSchema,
        },
      },
      role: {
        type: ["CUSTOMER", "ADMIN"],
        required: true,
        defaultValue: "CUSTOMER",
        input: false,
      },
      active: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
  session: {
    expiresIn: SEVEN_DAYS_IN_SECONDS,
    updateAge: ONE_DAY_IN_SECONDS,
    cookieCache: {
      enabled: false,
    },
  },
  verification: {
    storeIdentifier: "hashed",
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  advanced: {
    cookiePrefix: "comeat",
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      generateId: "uuid",
      joins: true,
    },
    backgroundTasks: {
      handler: (promise) => after(() => promise),
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const firstName = firstNameSchema.parse(user.firstName);
          const lastName = lastNameSchema.parse(user.lastName);

          return {
            data: {
              ...user,
              firstName,
              lastName,
              name: `${firstName} ${lastName}`,
            },
          };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { active: true },
          });

          return user?.active === true;
        },
      },
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
