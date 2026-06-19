import "@/styles/globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { NextComponentType, NextPageContext } from "next";
import { useState } from "react";

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

  return (
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
}
