// a next.js route that handles a JSON post request with prompt and model
// and calls the Cloudflare Workers AI model

import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const context = getRequestContext()
    const { AI, BUCKET } = context.env
    let { prompt, model } = await request.json<{ prompt: string, model: string }>()
    if (!model) model = "@cf/black-forest-labs/flux-1-schnell"

    const inputs = { prompt }
    const response = await AI.run(model, inputs)

    const promptKey = encodeURIComponent(prompt.replace(/\s/g, '-'))
    const binaryString = atob(response.image);
    // @ts-ignore
    const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
    await BUCKET.put(`${promptKey}.jpeg`, img, { httpMetadata: { contentType: 'image/jpeg' } })

    return new Response(`data:image/jpeg;base64,${response.image}`, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    })
  } catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}
