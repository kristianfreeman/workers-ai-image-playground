// a next.js route that handles a JSON post request with prompt and model
// and calls the Cloudflare Workers AI model

import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const ai = getRequestContext().env.AI
  let { prompt, model } = await request.json<{ prompt: string, model: string }>()
  if (!model) model = "@cf/black-forest-labs/flux-1-schnell"

  const inputs = { prompt }
  const response = await ai.run(model, inputs)
  return new Response(`data:image/png;base64,${response.image}`, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
