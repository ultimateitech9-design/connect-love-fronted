"use client";

import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
 const [queryClient] = useState(() => {
  let client: QueryClient;
  client = new QueryClient({
   mutationCache: new MutationCache({
    onSuccess: () => {
     // One write may affect profile, discovery, matches, messages and dashboards.
     void client.invalidateQueries({ type: 'active' });
    },
   }),
   defaultOptions: {
    queries: {
     staleTime: 3_000,
     refetchInterval: 5_000,
     refetchIntervalInBackground: false,
     refetchOnMount: 'always',
     refetchOnWindowFocus: 'always',
     refetchOnReconnect: 'always',
    },
   },
  });
  return client;
 });

 useEffect(() => {
  const syncActiveData = () => {
   if (document.visibilityState === 'visible' && navigator.onLine) {
    void queryClient.invalidateQueries({ type: 'active' });
   }
  };
  window.addEventListener('focus', syncActiveData);
  window.addEventListener('online', syncActiveData);
  document.addEventListener('visibilitychange', syncActiveData);
  return () => {
   window.removeEventListener('focus', syncActiveData);
   window.removeEventListener('online', syncActiveData);
   document.removeEventListener('visibilitychange', syncActiveData);
  };
 }, [queryClient]);

 return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}