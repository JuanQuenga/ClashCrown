import "@/styles/globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { NextComponentType, NextPageContext } from "next";
import { useState } from "react";
import { convexUrl, isConvexConfigured } from "@/lib/convex";

type ClashCrownAppProps = {
  Component: NextComponentType<NextPageContext, unknown, Record<string, unknown>>;
  pageProps: Record<string, unknown>;
};

export default function App({ Component, pageProps }: ClashCrownAppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: Infinity
          }
        }
      })
  );

  const app = (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Clash Crown</title>
        <meta
          name="description"
          content="Track Clash Royale stats, decks, chests, battles, and clan progression."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </QueryClientProvider>
  );

  if (!isConvexConfigured) return app;
  return <ConfiguredConvexProvider>{app}</ConfiguredConvexProvider>;
}

function ConfiguredConvexProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new ConvexReactClient(convexUrl));
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
