import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  if (!key) { return new Response('Missing key', { status: 400 }) }

  const context = getRequestContext()
  const { BUCKET } = context.env

  const object = await BUCKET.get(key as string)
  if (!object) { return new Response('Not found', { status: 404 }) }

  const data = await object.arrayBuffer()
  const contentType = object.httpMetadata?.contentType ?? ''

  return new Response(data, {
    headers: {
      'Content-Type': contentType
    },
  })
}
