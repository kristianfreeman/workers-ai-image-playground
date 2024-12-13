import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { z } from 'zod'
import { authenticate } from '@cloudflare/access'

export const runtime = 'edge'

const requestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const context = getRequestContext()
    const { AI, BUCKET } = context.env
    const parsedRequest = requestSchema.safeParse(await request.json())

    if (!parsedRequest.success) {
      return new Response(JSON.stringify({
        error: "Invalid request data",
        details: parsedRequest.error.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    let { prompt, model } = parsedRequest.data
    if (!model) model = "@cf/black-forest-labs/flux-1-schnell"

    // Authenticate the request using Cloudflare Access
    const authResult = await authenticate(request)
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
        description: "You are not authorized to access this resource."
      }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

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
