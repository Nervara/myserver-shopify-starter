import type { LoaderFunctionArgs } from "@remix-run/node";

// Liveness/readiness probe for myserver's health check (set Health Check Path
// to /healthz in the app's settings). Returns 200 once the server is up and
// Postgres is reachable.
export const loader = async (_args: LoaderFunctionArgs) => {
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};
