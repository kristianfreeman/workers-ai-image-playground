import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function GET() {
  try {
    const context = getRequestContext()
    const { BUCKET } = context.env

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
