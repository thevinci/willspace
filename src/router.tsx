import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Identity } from "spacetimedb";
import { AuthProvider, useAuth } from "react-oidc-context";
import { useMemo, type ReactNode } from "react";
import { routeTree } from "./routeTree.gen";
import {
  SpacetimeDBQueryClient,
  SpacetimeDBProvider,
} from "spacetimedb/tanstack";
import { DbConnection, ErrorContext } from "./module_bindings";

const HOST = import.meta.env.VITE_SPACETIMEDB_HOST ?? "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "tanstack-ts";
const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;
const AUTHORITY = "https://auth.spacetimedb.com/oidc";
const AUTH_CLIENT_ID = import.meta.env.VITE_SPACETIMEAUTH_CLIENT_ID ?? "";

const spacetimeDBQueryClient = new SpacetimeDBQueryClient();

const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: spacetimeDBQueryClient.queryFn,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});
spacetimeDBQueryClient.connect(queryClient);

const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
  console.log(
    "Connected to SpacetimeDB with identity:",
    identity.toHexString(),
  );
  spacetimeDBQueryClient.setConnection(conn);
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.error("Error connecting to SpacetimeDB:", err);
};

function AuthenticatedSpacetimeProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const token =
    auth.user?.id_token ??
    auth.user?.access_token ??
    (typeof localStorage !== "undefined"
      ? (localStorage.getItem(TOKEN_KEY) ?? undefined)
      : undefined);

  const authenticatedConnectionBuilder = useMemo(
    () =>
      DbConnection.builder()
        .withUri(HOST)
        .withDatabaseName(DB_NAME)
        .withToken(token)
        .onConnect(onConnect)
        .onDisconnect(onDisconnect)
        .onConnectError(onConnectError),
    [token],
  );

  return (
    <SpacetimeDBProvider connectionBuilder={authenticatedConnectionBuilder}>
      {children}
    </SpacetimeDBProvider>
  );
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: () => (
      <div style={{ padding: "2rem" }}>
        <h1>404</h1>
        <p>Page Not Found</p>
      </div>
    ),
    context: { queryClient },
    Wrap: ({ children }) => (
      <AuthProvider
        authority={AUTHORITY}
        client_id={AUTH_CLIENT_ID || "not-configured"}
        redirect_uri={`${typeof window === "undefined" ? "" : window.location.origin}/callback`}
        post_logout_redirect_uri={
          typeof window === "undefined" ? "/" : window.location.origin
        }
        scope="openid profile email"
        response_type="code"
        automaticSilentRenew
        onSigninCallback={() => {
          window.location.replace("/");
        }}
      >
        <AuthenticatedSpacetimeProvider>
          {children}
        </AuthenticatedSpacetimeProvider>
      </AuthProvider>
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
