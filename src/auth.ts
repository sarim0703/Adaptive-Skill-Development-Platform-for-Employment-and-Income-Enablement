import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users, authCredentials } from "@/db/schema";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-careerorbit.session-token" : "careerorbit.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailStr = String(credentials.email);
        const passwordStr = String(credentials.password);

        const [user] = await db.select().from(users).where(eq(users.email, emailStr));

        if (!user) {
          throw new Error("User not found.");
        }

        const [credential] = await db
          .select()
          .from(authCredentials)
          .where(eq(authCredentials.userId, user.id));

        if (!credential) {
          throw new Error("Password not found for this user.");
        }

        const passwordsMatch = await bcrypt.compare(passwordStr, credential.passwordHash);

        if (!passwordsMatch) {
          throw new Error("Invalid password.");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
