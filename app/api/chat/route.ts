import type { NextRequest } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const context = getRequestContext()
    const { AI, D1, DURABLE_OBJECTS } = context.env
    const { message, sessionId, model } = await request.json<{ message: string, sessionId: string, model: string }>()

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
    return new Response(error.message, { status: 500 })
  }
}
