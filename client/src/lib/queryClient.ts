import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = "";
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      // If not JSON, get as text
      const text = await res.text() || res.statusText;
      errorMessage = text;
    }
    
    // Special handling for 401 errors
    if (res.status === 401) {
      if (res.url.includes('/api/login')) {
        throw new Error(`Invalid username or password. Please try again.`);
      } else {
        throw new Error(`Authentication required. Please log in.`);
      }
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Set a lower staleTime for more responsive data fetching
      staleTime: 1000 * 60, // 1 minute (using Infinity was causing stale data)
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
