import { NextRequest, NextResponse } from 'next/server'
import { geminiClient } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const { nodeTitle, chatHistory, userMessage } = await request.json()

    if (!nodeTitle || typeof nodeTitle !== 'string') {
      return NextResponse.json(
        { error: 'Node title is required' },
        { status: 400 }
      )
    }

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      )
    }

    const result = await geminiClient.chatWithAI(
      nodeTitle.trim(),
      chatHistory || [],
      userMessage.trim()
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      response: result.response
    })

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}