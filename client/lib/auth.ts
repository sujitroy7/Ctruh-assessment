import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login, logout, refreshAccessToken } from "./api/auth";
import { Role } from "@/types/auth";

/**
 * 15 Days - Maximum session lifetime in seconds.
 */
const SESSION_MAX_AGE = 15 * 24 * 60 * 60;
/**
 * Time before token expiry (in milliseconds).
 */
const TOKEN_REFRESH_BUFFER = 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE, // keep in sync with backend refresh token TTL
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // `role` is only sent from the admin login form to scope the login request
        role: { label: "Role", type: "text" },
      },

      /**
       * Validates credentials against the backend and returns a user object
       * that NextAuth will persist into the JWT. Returns null on any failure
       * so NextAuth can surface the appropriate error to the UI.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing credentials");

        try {
          return await login(
            credentials.email,
            credentials.password,
            credentials?.role as Role,
          );
        } catch (error) {
          console.error("[auth] authorize failed:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    /**
     * Runs on every sign-in and on every request that reads the session.
     * - First call (user object present): seed the JWT with tokens from authorize()
     * - Subsequent calls: pass through if token is still valid, refresh if near expiry
     */
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      // Refresh proactively 60s before expiry to avoid serving an expired token
      if (Date.now() < token.accessTokenExpires - TOKEN_REFRESH_BUFFER) {
        return token;
      }

      try {
        const { access_token, refresh_token } = await refreshAccessToken(
          token.refreshToken,
        );

        return {
          ...token,
          accessToken: access_token,
          refreshToken: refresh_token,
        };
      } catch (error) {
        console.error("[auth] token refresh failed:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    /**
     * Shapes what useSession() and getServerSession() return to the app.
     * Copies token fields onto the session object so components
     * can access the access token and role without touching the JWT directly.
     */
    async session({ session, token }) {
      session = {
        ...session,
        accessToken: token.accessToken,
        accessTokenExpires: token.accessTokenExpires,
        error: token.error,
        refreshToken: session.refreshToken,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
      return session;
    },
  },

  events: {
    async signOut() {
      try {
        await logout();
      } catch (error) {
        console.error("[auth] backend logout failed:", error);
      }
    },
  },

  pages: {
    signIn: "/login",
  },

  debug: process.env.NODE_ENV === "development",
};
