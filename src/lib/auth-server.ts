import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import * as bcrypt from "bcryptjs";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false, // Don't auto-sign in if verification is enabled
        password: {
            hash: async (password: string) => {
                return bcrypt.hash(password, 10);
            },
            verify: async ({ hash, password }: { hash: string; password: string }) => {
                return bcrypt.compare(password, hash);
            },
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const { sendEmail, emailTemplates } = await import("./mail");
            const { subject, html } = emailTemplates.activation(user.name, url);
            await sendEmail({
                to: user.email,
                subject,
                html,
            });
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "company", // Public registration is for companies
                input: false,
            },
            plan: {
                type: "string",
                input: false,
            },
            planExpireDate: {
                type: "date",
                input: false,
            },
            isActive: {
                type: "boolean",
                defaultValue: true,
                input: false,
            },
            branchId: {
                type: "string",
                input: false,
            },
            departmentId: {
                type: "string",
                input: false,
            },
            ownerId: {
                type: "string",
                input: false,
            },
        },
    },
});

