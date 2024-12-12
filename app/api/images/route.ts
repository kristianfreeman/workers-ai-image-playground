import { getRequestContext } from '@cloudflare/next-on-pages'
import { authenticate } from '@cloudflare/access'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const context = getRequestContext()
    const { BUCKET } = context.env

    // Authenticate the request using Cloudflare Access
    const authResult = await authenticate(request)
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        description: "You are not authorized to access this resource."
      }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    const options = { limit: 500 }

    const listed = await BUCKET.list(options);
    let truncated = listed.truncated;
    // @ts-ignore
    let cursor = truncated ? listed.cursor : undefined;

    while (truncated) {
      const next = await BUCKET.list({
        ...options,
        cursor: cursor,
      });
      listed.objects.push(...next.objects);

      truncated = next.truncated;
      // @ts-ignore
      cursor = next.cursor
    }

    return new Response(JSON.stringify(listed.objects), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error("Error processing request:", error)
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
