import type { LoaderFunctionArgs } from "@remix-run/node";

import { authenticate } from "../shopify.server";

// Catch-all OAuth route. @shopify/shopify-app-remix handles the begin/callback
// handshake here (authPathPrefix is "/auth" in shopify.server.ts).
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};
