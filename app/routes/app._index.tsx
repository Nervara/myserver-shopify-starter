import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Banner,
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Minimal GraphQL Admin API call to prove the OAuth token works end to end.
  const response = await admin.graphql(
    `#graphql
      query shopInfo {
        shop {
          name
          myshopifyDomain
          plan { displayName }
        }
      }`,
  );
  const body = await response.json();

  return {
    shop: session.shop,
    info: body.data?.shop ?? null,
  };
};

export default function Index() {
  const { shop, info } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Shopify app" />
      <Layout>
        <Layout.Section>
          <Banner tone="success" title="Your app is running on myserver">
            <p>
              OAuth, Postgres-backed sessions, and the Admin GraphQL API are all
              wired up. Edit <code>app/routes/app._index.tsx</code> to build your
              app.
            </p>
          </Banner>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Connected store
              </Text>
              <Text as="p" variant="bodyMd">
                Shop: <b>{shop}</b>
              </Text>
              {info ? (
                <Text as="p" variant="bodyMd">
                  {info.name} — {info.plan?.displayName} plan (
                  {info.myshopifyDomain})
                </Text>
              ) : (
                <Text as="p" tone="subdued" variant="bodyMd">
                  Shop details unavailable.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
