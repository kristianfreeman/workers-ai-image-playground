// a next.js route that handles a JSON post request with prompt and model
// and calls the Cloudflare Workers AI model

import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const context = getRequestContext()
  const { AI, BUCKET } = context.env
  let { prompt, model } = await request.json<{ prompt: string, model: string }>()
  if (!model) model = "@cf/black-forest-labs/flux-1-schnell"

  const inputs = { prompt }
  const response = await AI.run(model, inputs)

  const promptToPath = (prompt: string) => prompt.replace(/[^a-zA-Z0-9]/g, '-')
  const imageData = response.image
  await BUCKET.put(`/${promptToPath(prompt)}.png`, imageData, { httpMetadata: { contentType: 'image/png' } })

  return new Response(`data:image/png;base64,${response.image}`, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
