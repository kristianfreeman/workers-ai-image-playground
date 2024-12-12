import { getRequestContext } from '@cloudflare/next-on-pages';
import Cloudflare from 'cloudflare';

export const runtime = 'edge';

export async function GET(_request: Request) {
  const env = getRequestContext().env;
  const { CLOUDFLARE_ACCOUNT_ID: account_id, CLOUDFLARE_API_TOKEN } = env;

  if (!account_id) return new Response("Account ID not specified", { status: 400 });
  if (!CLOUDFLARE_API_TOKEN) return new Response("API token not specified", { status: 400 });

  try {
    const client = new Cloudflare({
      apiToken: CLOUDFLARE_API_TOKEN,
    });

    const models = await client.workers.ai.models.list({
      account_id,
    });

    const compatibleModels = models.filter((model: any) => {
      // Add compatibility check logic here
      return true; // Placeholder, assume all models are compatible for now
    });

    return new Response(JSON.stringify(compatibleModels), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
