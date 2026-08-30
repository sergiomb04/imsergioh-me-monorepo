import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import GoogleProvider from "next-auth/providers/google";
import { isAdminEmailAllowed } from "@/lib/adminAllowedEmails";

export const authOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXT_AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = user?.email || profile?.email;
      return isAdminEmailAllowed(email);
    },
  },
};

const handler = NextAuth(authOptions);

export const handlers = {
  GET: handler,
  POST: handler,
};

export async function auth() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    // If JWT decryption fails (stale cookie or rotated secret), treat as signed-out.
    if (error instanceof Error && error.message.includes("decryption operation failed")) {
      return null;
    }

    throw error;
  }
}

export { signIn, signOut };