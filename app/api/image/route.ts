import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    if (!key) {
      return new Response(JSON.stringify({
        error: "Missing key",
        code: "MISSING_KEY",
        description: "The 'key' query parameter is required."
      }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const context = getRequestContext()
    const { BUCKET } = context.env

    const object = await BUCKET.get(key as string)
    if (!object) {
      return new Response(JSON.stringify({
        error: "Not found",
        code: "NOT_FOUND",
        description: `No object found for key: ${key}`
      }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    const data = await object.arrayBuffer()
    const contentType = object.httpMetadata?.contentType ?? ''

    return new Response(data, {
      headers: {
        'Content-Type': contentType
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
