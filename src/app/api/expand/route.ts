import { NextRequest, NextResponse } from 'next/server'
import { geminiClient } from '@/lib/gemini/client'

export async function POST(request: NextRequest) {
  try {
    const { nodeTitle, nodeDescription } = await request.json()

    if (!nodeTitle || typeof nodeTitle !== 'string') {
      return NextResponse.json(
        { error: 'Node title is required' },
        { status: 400 }
      )
    }

    const result = await geminiClient.expandNode(
      nodeTitle.trim(),
      nodeDescription?.trim()
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to expand node' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      nodes: result.nodes
    })

  } catch (error) {
    console.error('Error in expand API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}