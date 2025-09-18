'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Loading } from '@/components/ui'
import { useMapStore } from '@/lib/stores/mapStore'
import { ChatMessage } from '@/types'
import { Send, X, Brain, User } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface ChatInterfaceProps {
  isOpen: boolean
  nodeId: string | null
  onClose: () => void
}

export function ChatInterface({ isOpen, nodeId, onClose }: ChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { nodes, addChatMessage } = useMapStore()

  const currentNode = nodeId ? nodes.find(n => n.id === nodeId) : null
  const chatHistory = (currentNode?.metadata as any)?.chatHistory || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSendMessage = async () => {
    if (!message.trim() || !currentNode || isLoading) return

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    }

    // Add user message
    addChatMessage(currentNode.id, userMessage)
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeTitle: currentNode.title,
          chatHistory: [...chatHistory, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          userMessage: userMessage.content,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }

        addChatMessage(currentNode.id, aiMessage)
      } else {
        // Error message
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        }

        addChatMessage(currentNode.id, errorMessage)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting. Please try again.',
        timestamp: new Date().toISOString(),
      }

      addChatMessage(currentNode.id, errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen || !currentNode) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-6 top-6 bottom-6 w-96 z-50"
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Chat about: {currentNode.title}</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-96">
              {chatHistory.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation about this node!</p>
                  <p className="text-xs mt-1">
                    Ask questions, brainstorm ideas, or get suggestions.
                  </p>
                </div>
              )}

              {chatHistory.map((msg: ChatMessage) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-2 text-sm
                      ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'claymorphic'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-2">
                      {msg.role === 'assistant' && (
                        <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      {msg.role === 'user' && (
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="claymorphic rounded-2xl px-4 py-2 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <Loading size="sm" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about this idea..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                size="icon"
                variant="primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Press Enter to send • AI responses may vary
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}