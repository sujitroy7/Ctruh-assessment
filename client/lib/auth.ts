import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Calls the backend refresh endpoint to get a new access token.
 * Falls back to rotating the existing refresh token if the backend sends one.
 * On failure, sets `error: "RefreshAccessTokenError"` — middleware picks this
 * up and forces the user to sign in again.
 */
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });

    const refreshed = await res.json();

    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      // use rotated refresh token if provided, otherwise keep the existing one
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("[auth] token refresh failed:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60, // keep in sync with backend refresh token TTL
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
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
              // omit role for regular customer logins
              ...(credentials?.role && { role: credentials.role }),
            }),
          });

          const data = await res.json();

          if (!res.ok || !data) return null;

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role, // role comes from backend, never trust client input
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            accessTokenExpires: Date.now() + data.expires_in * 1000,
          };
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
      if (Date.now() < token.accessTokenExpires - 60 * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },

    /**
     * Shapes what useSession() and getServerSession() return to the app.
     * Copies token fields onto the session object so components
     * can access the access token and role without touching the JWT directly.
     */
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;
      return session;
    },
  },

  events: {
    // Tell the backend to invalidate the refresh token on explicit sign-out.
    // If this request fails the user is still logged out on our end — non-critical.
    async signOut({ token }) {
      try {
        await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.accessToken}`,
          },
          body: JSON.stringify({ refresh_token: token.refreshToken }),
        });
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
