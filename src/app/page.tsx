'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent, Loading } from '@/components/ui'
import { useMapStore } from '@/lib/stores/mapStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { isSupabaseEnabled } from '@/lib/supabase/client'
import { Brain, Sparkles, ArrowRight, Zap, Target, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'

export default function HomePage() {
  const router = useRouter()
  const [seedIdea, setSeedIdea] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { user, isLoading: authLoading, initialize } = useAuthStore()
  const { addNode, setCurrentMap, reset } = useMapStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleCreateMap = async () => {
    if (!seedIdea.trim()) return

    setIsCreating(true)

    try {
      // Reset store for new map
      reset()

      // Create new map
      const newMap = {
        id: uuidv4(),
        user_id: user?.id || null,
        title: seedIdea.trim(),
        description: `Mind map started with: ${seedIdea.trim()}`,
        is_public: false,
        slug: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setCurrentMap(newMap)

      // Create root node
      addNode({
        map_id: newMap.id,
        parent_id: null,
        type: 'idea',
        title: seedIdea.trim(),
        description: 'Root idea for this mind map',
        metadata: {
          color: '#8B5CF6',
          size: 'large',
          expanded: false,
          aiGenerated: false,
        },
        position: { x: 0, y: 0 },
      })

      // Navigate to map editor
      router.push(`/map/${newMap.id}`)
    } catch (error) {
      console.error('Error creating map:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Expansion',
      description: 'Let Gemini help you break down complex ideas into actionable components',
    },
    {
      icon: Target,
      title: 'Task Management',
      description: 'Convert any idea into trackable tasks with our integrated Kanban board',
    },
    {
      icon: Sparkles,
      title: 'Claymorphic Design',
      description: 'Beautiful, tactile interface that makes brainstorming feel natural',
    },
    {
      icon: Share2,
      title: 'Collaboration Ready',
      description: 'Share your mind maps publicly or work with your team seamlessly',
    },
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Initializing AetherFlow..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="claymorphic mx-6 mt-6 rounded-3xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AetherFlow</span>
            </div>

            <div className="flex items-center space-x-4">
              {isSupabaseEnabled() && !user && (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </div>
              )}
              {user && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            Turn Ideas Into Action
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            AetherFlow combines AI-powered mind mapping with task management.
            Start with a single idea and watch it grow into a complete action plan.
          </p>

          {/* Seed Idea Input */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card className="p-8">
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-4">What&apos;s on your mind?</h3>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Start a podcast, Plan a trip to Japan, Learn Python..."
                      value={seedIdea}
                      onChange={(e) => setSeedIdea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateMap()}
                      className="flex-1 text-lg"
                      disabled={isCreating}
                    />
                    <Button
                      onClick={handleCreateMap}
                      disabled={!seedIdea.trim() || isCreating}
                      size="lg"
                      variant="primary"
                      className="flex items-center space-x-2"
                    >
                      {isCreating ? (
                        <Loading size="sm" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Create Map</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI will help expand your idea into a structured mind map
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Example Ideas */}
          <div className="claymorphic rounded-3xl p-8">
            <h3 className="text-lg font-medium mb-6">Try these example ideas:</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                'Start a YouTube channel',
                'Plan a wedding',
                'Launch a SaaS product',
                'Learn web development',
                'Organize a hackathon',
                'Write a novel',
              ].map((idea) => (
                <Button
                  key={idea}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSeedIdea(idea)}
                  className="rounded-full"
                >
                  {idea}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="claymorphic mx-6 mb-6 rounded-3xl">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Supabase, and Gemini AI • Open source on GitHub
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}