import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

// Host/HMR config so the app works behind myserver's reverse proxy (Caddy)
// and in Shopify's embedded iframe. SHOPIFY_APP_URL is the public HTTPS URL.
const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    host: "0.0.0.0",
    hmr:
      host === "localhost"
        ? undefined
        : { protocol: "wss", host, port: 443, clientPort: 443 },
    allowedHosts: [host],
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: { assetsInlineLimit: 0 },
});
