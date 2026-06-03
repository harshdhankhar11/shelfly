import { compare } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { UserRole } from "@/app/generated/prisma";
import prisma from "@/utils/prisma";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        passwordHash: true,
                        role: true,
                        accountStatus: true,
                        emailVerified: true,
                    },
                });

                if (!user || user.accountStatus !== "ACTIVE") {
                    return null;
                }

                if (user.emailVerified === false) {
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                const passwordMatches = await compare(credentials.password, user.passwordHash);

                if (!passwordMatches) {
                    return null;
                }

                await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        lastLoginAt: new Date(),
                    },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id;
                session.user.role = token.role ?? UserRole.SELLER;
            }

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export async function auth() {
    try {
        return await getServerSession(authOptions);
    } catch (error) {
        console.error("NextAuth session lookup failed", error);
        return null;
    }
}