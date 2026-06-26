import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { login } from "../shopify.server";

// Public landing route. If Shopify sends a ?shop= param, kick straight into
// the OAuth/login flow; otherwise show a one-line install hint.
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function Index() {
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 40 }}>
      <h1>Shopify app</h1>
      <p>
        Install this app from your Shopify admin, or open it with a{" "}
        <code>?shop=your-store.myshopify.com</code> query parameter.
      </p>
    </main>
  );
}
