import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { useEffect, type ReactNode } from "react";
import { store, clearCredentials, setGlobalLoading, addToast, setUser } from "../shared/redux";
import { configureApiClient, ApiClientError, authApi } from "../shared/api";
import { useAppSelector, useAppDispatch } from "../shared/redux";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry on auth errors (401) or client errors (4xx)
        if (error instanceof ApiClientError) {
          if (error.status === 401 || error.status === 403) {
            return false; // Auth errors should not retry
          }
          if (error.status >= 400 && error.status < 500) {
            return false; // Client errors (validation, not found, etc.)
          }
        }
        // Retry server errors (5xx) and network errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: false, // Don't retry mutations by default (avoid duplicate operations)
      onMutate: () => {
        // Show global loading indicator when mutation starts
        store.dispatch(setGlobalLoading(true));
      },
      onSettled: () => {
        // Hide global loading indicator when mutation completes (success or error)
        store.dispatch(setGlobalLoading(false));
      },
      onError: (error) => {
        // Show error toast for failed mutations
        const message =
          error instanceof ApiClientError
            ? error.message
            : "An unexpected error occurred. Please try again.";

        store.dispatch(
          addToast({
            type: "error",
            message,
          })
        );
      },
    },
  },
});

// Configure API client once at load so the Bearer token is attached to the very first
// request. If this ran in useEffect, the dashboard could fire a request before the
// effect ran, so no token would be sent → 401 → clearCredentials → redirect to login.
configureApiClient({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => store.dispatch(clearCredentials()),
});

/** When we have a token but no user (e.g. after refresh), fetch current user so navbar shows name. */
function AuthRestoreUser({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!token || user) return;
    authApi
      .me()
      .then((userData) => dispatch(setUser(userData)))
      .catch(() => {}); // 401 → onUnauthorized clears credentials
  }, [token, user, dispatch]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthRestoreUser>{children}</AuthRestoreUser>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
