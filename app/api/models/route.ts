import { getRequestContext } from '@cloudflare/next-on-pages';
import Cloudflare from 'cloudflare';
import { authenticate } from '@cloudflare/access';

export const runtime = 'edge';

export async function GET(request: Request) {
  const env = getRequestContext().env;
  const { CLOUDFLARE_ACCOUNT_ID: account_id, CLOUDFLARE_API_TOKEN } = env;

  if (!account_id) {
    return new Response(JSON.stringify({
      error: "Account ID not specified",
      code: "MISSING_ACCOUNT_ID",
      description: "The 'CLOUDFLARE_ACCOUNT_ID' environment variable is required."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!CLOUDFLARE_API_TOKEN) {
    return new Response(JSON.stringify({
      error: "API token not specified",
      code: "MISSING_API_TOKEN",
      description: "The 'CLOUDFLARE_API_TOKEN' environment variable is required."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Authenticate the request using Cloudflare Access
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        description: "You are not authorized to access this resource."
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

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
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
