import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { z } from 'zod'

export const runtime = 'edge'

const requestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  model: z.string().min(1, "Model is required")
})

export async function POST(request: NextRequest) {
  try {
    const context = getRequestContext()
    const { AI, D1, DURABLE_OBJECTS } = context.env
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

    const { message, sessionId, model } = parsedRequest.data

    // Use Durable Objects to manage active chat sessions
    const session = await DURABLE_OBJECTS.get(sessionId)
    const chatHistory = await session.fetch('/history')
    const chatLogs = await chatHistory.json()

    // Add the new message to the chat logs
    chatLogs.push({ sender: 'user', message })

    // Generate AI response
    const inputs = { message }
    const response = await AI.run(model, inputs)
    chatLogs.push({ sender: 'ai', message: response.message })

    // Store the updated chat logs in D1
    await D1.put(sessionId, JSON.stringify(chatLogs))

    return new Response(JSON.stringify({ message: response.message }), {
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
