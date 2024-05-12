import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "./data/getUserByEmail";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    /**
     * this event is triggered for Google & github providers accounts
     */
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // allow oauth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user?.id);
      // prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;
      // add 2fa check here
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            role: token.role,
          },
        };
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      return {
        ...token,
        role: existingUser?.role,
      };
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
