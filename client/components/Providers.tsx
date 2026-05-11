"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <NextAuthSessionProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </NuqsAdapter>
    </NextAuthSessionProvider>
  );
}
