import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import { GeminiResponse, NodeType } from '@/types'

class GeminiClient {
  private model: GenerativeModel | null = null
  private isEnabled: boolean = false

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      this.isEnabled = true
    }
  }

  public isGeminiEnabled(): boolean {
    return this.isEnabled
  }

  private buildExpansionPrompt(nodeTitle: string, nodeDescription?: string): string {
    return `You are an AI assistant helping users expand their ideas into structured mind maps. Given a node with the title "${nodeTitle}"${nodeDescription ? ` and description "${nodeDescription}"` : ''}, generate 3-5 meaningful child nodes that break down or expand upon this concept.

IMPORTANT: Respond ONLY with valid JSON in the following format:
{
  "nodes": [
    {
      "title": "Short, clear title (max 50 chars)",
      "description": "Brief explanation (max 200 chars)",
      "type": "idea",
      "category": "optional category"
    }
  ]
}

Guidelines:
- Create practical, actionable breakdowns
- Mix different types of nodes (idea, task, note)
- Include diverse perspectives (planning, execution, risks, resources)
- Keep titles concise and descriptions informative
- For projects: include planning, execution, and evaluation phases
- For topics: include research, analysis, and application aspects
- For goals: include preparation, action steps, and success metrics

Generate 3-5 child nodes now:`
  }

  private buildChatPrompt(nodeTitle: string, chatHistory: string, userMessage: string): string {
    return `You are an AI brainstorming partner helping a user explore the concept: "${nodeTitle}".

Chat History:
${chatHistory}

User's latest message: "${userMessage}"

Respond conversationally to help brainstorm, analyze, or expand on this topic. Be helpful, creative, and ask follow-up questions when appropriate. Keep responses concise but insightful (max 300 words).`
  }

  public async expandNode(
    nodeTitle: string,
    nodeDescription?: string
  ): Promise<{ success: boolean; nodes?: any[]; error?: string }> {
    if (!this.isEnabled || !this.model) {
      // Fallback: create generic child nodes
      const fallbackNodes = [
        {
          title: "Planning & Preparation",
          description: "Initial steps and requirements for getting started",
          type: "idea" as NodeType,
          category: "planning"
        },
        {
          title: "Implementation Tasks",
          description: "Core actions needed to accomplish this goal",
          type: "task" as NodeType,
          category: "execution"
        },
        {
          title: "Resources & Tools",
          description: "Materials, tools, or knowledge required",
          type: "note" as NodeType,
          category: "resources"
        }
      ]

      return { success: true, nodes: fallbackNodes }
    }

    try {
      const prompt = this.buildExpansionPrompt(nodeTitle, nodeDescription)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse JSON response
      let parsedResponse: GeminiResponse
      try {
        // Extract JSON from response if it's wrapped in markdown or other text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        const jsonText = jsonMatch ? jsonMatch[0] : text
        parsedResponse = JSON.parse(jsonText)
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError)

        // Retry once with a simpler prompt
        try {
          const retryPrompt = `Generate 3 child nodes for "${nodeTitle}". Respond with JSON: {"nodes":[{"title":"Title","description":"Description","type":"idea"}]}`
          const retryResult = await this.model.generateContent(retryPrompt)
          const retryResponse = await retryResult.response
          const retryText = retryResponse.text()
          const retryJsonMatch = retryText.match(/\{[\s\S]*\}/)
          const retryJsonText = retryJsonMatch ? retryJsonMatch[0] : retryText
          parsedResponse = JSON.parse(retryJsonText)
        } catch (retryError) {
          // Final fallback
          return { success: false, error: 'Failed to parse AI response after retry' }
        }
      }

      // Validate response structure
      if (!parsedResponse.nodes || !Array.isArray(parsedResponse.nodes)) {
        return { success: false, error: 'Invalid response structure from AI' }
      }

      // Sanitize and validate nodes
      const validatedNodes = parsedResponse.nodes
        .filter(node => node.title && node.title.trim().length > 0)
        .map(node => ({
          title: node.title.trim().substring(0, 100),
          description: (node.description || '').trim().substring(0, 300),
          type: ['idea', 'task', 'note'].includes(node.type) ? node.type : 'idea',
          category: node.category?.trim().substring(0, 50) || undefined
        }))
        .slice(0, 6) // Limit to max 6 nodes

      if (validatedNodes.length === 0) {
        return { success: false, error: 'No valid nodes generated' }
      }

      return { success: true, nodes: validatedNodes }

    } catch (error) {
      console.error('Error calling Gemini API:', error)
      return { success: false, error: 'Failed to generate expansion' }
    }
  }

  public async chatWithAI(
    nodeTitle: string,
    chatHistory: { role: string; content: string }[],
    userMessage: string
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    if (!this.isEnabled || !this.model) {
      return {
        success: false,
        error: 'AI chat is not available in local mode'
      }
    }

    try {
      const historyText = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const prompt = this.buildChatPrompt(nodeTitle, historyText, userMessage)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return { success: true, response: text.trim() }

    } catch (error) {
      console.error('Error in AI chat:', error)
      return { success: false, error: 'Failed to get AI response' }
    }
  }
}

export const geminiClient = new GeminiClient()