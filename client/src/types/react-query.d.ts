// Type declarations for @tanstack/react-query
declare module '@tanstack/react-query' {
  export interface UseQueryOptions<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  > {
    queryKey: TQueryKey;
    queryFn?: QueryFunction<TQueryFnData, TQueryKey>;
    enabled?: boolean;
    retry?: RetryValue<TError>;
    retryDelay?: RetryDelayValue<TError>;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    notifyOnChangeProps?: NotifyOnChangeProps;
    onSuccess?: (data: TData) => void;
    onError?: (err: TError) => void;
    onSettled?: (data: TData | undefined, error: TError | null) => void;
    select?: (data: TQueryFnData) => TData;
    suspense?: boolean;
    initialData?: TData | InitialDataFunction<TData>;
    initialDataUpdatedAt?: number | (() => number | undefined);
    placeholderData?: TQueryFnData | PlaceholderDataFunction<TQueryFnData>;
    keepPreviousData?: boolean;
    structuralSharing?: boolean;
    useErrorBoundary?: boolean;
  }

  export type QueryKey = string | readonly unknown[];
  export type QueryFunction<T = unknown, TQueryKey extends QueryKey = QueryKey> = (
    context: QueryFunctionContext<TQueryKey>
  ) => T | Promise<T>;
  export type QueryFunctionContext<TQueryKey extends QueryKey = QueryKey> = {
    queryKey: TQueryKey;
    pageParam?: unknown;
    meta: Record<string, unknown> | undefined;
  };
  export type RetryValue<TError> = boolean | number | ((failureCount: number, error: TError) => boolean);
  export type RetryDelayValue<TError> = number | ((failureCount: number, error: TError) => number);
  export type NotifyOnChangeProps = 'all' | string[] | ((prev: unknown, next: unknown) => boolean);
  export type InitialDataFunction<TData> = () => TData | undefined;
  export type PlaceholderDataFunction<TData> = () => TData | undefined;

  export function useQuery<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey
  >(
    options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
  ): {
    data: TData | undefined;
    dataUpdatedAt: number;
    error: TError | null;
    errorUpdatedAt: number;
    failureCount: number;
    isError: boolean;
    isFetched: boolean;
    isFetchedAfterMount: boolean;
    isFetching: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isLoadingError: boolean;
    isPlaceholderData: boolean;
    isPreviousData: boolean;
    isRefetchError: boolean;
    isStale: boolean;
    isSuccess: boolean;
    refetch: (options?: { throwOnError?: boolean; cancelRefetch?: boolean }) => Promise<unknown>;
    remove: () => void;
    status: 'idle' | 'loading' | 'success' | 'error';
  };

  // Add useMutation type definition
  export interface UseMutationOptions<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  > {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => Promise<void> | void;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
    onSettled?: (
      data: TData | undefined,
      error: TError | null,
      variables: TVariables,
      context: TContext | undefined
    ) => Promise<void> | void;
    retry?: RetryValue<TError>;
    retryDelay?: RetryDelayValue<TError>;
    useErrorBoundary?: boolean;
  }

  export function useMutation<
    TData = unknown,
    TError = unknown,
    TVariables = void,
    TContext = unknown
  >(
    options: UseMutationOptions<TData, TError, TVariables, TContext>
  ): {
    data: TData | undefined;
    error: TError | null;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isPending: boolean;
    isSuccess: boolean;
    mutate: (variables: TVariables, options?: { onSuccess?: (data: TData) => void; onError?: (error: TError) => void; onSettled?: (data: TData | undefined, error: TError | null) => void }) => void;
    mutateAsync: (variables: TVariables, options?: { onSuccess?: (data: TData) => void; onError?: (error: TError) => void; onSettled?: (data: TData | undefined, error: TError | null) => void }) => Promise<TData>;
    reset: () => void;
    status: 'idle' | 'loading' | 'success' | 'error';
  };
}
