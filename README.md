# AetherFlow

**AI-Powered Mind Mapping & Task Management**

AetherFlow is a production-ready web application that combines AI-powered mind mapping with integrated task management. Transform your ideas into actionable plans using Gemini AI, beautiful claymorphic design, and intuitive interactions.

![AetherFlow Demo](https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=AetherFlow+Demo)

## ✨ Features

### 🧠 AI-Powered Expansion
- **Gemini 2.0 Flash Integration**: Automatically expand any idea into structured subtasks and components
- **Intelligent Categorization**: AI suggests logical breakdowns including planning, execution, and evaluation phases
- **Fallback Handling**: Graceful degradation when AI is unavailable

### 💬 Interactive AI Chat
- **Node-Specific Conversations**: Chat with AI about any specific idea or node
- **Contextual Brainstorming**: Get suggestions, ask questions, and explore concepts deeply
- **Persistent Chat History**: All conversations are saved with each node

### 🎨 Claymorphic Design
- **Tactile Interface**: Soft, depth-rich design inspired by claymorphism
- **Smooth Animations**: Framer Motion powers delightful interactions
- **Responsive Layout**: Works beautifully on desktop and mobile

### 📋 Task Management
- **One-Click Taskify**: Convert any idea into a trackable task
- **Kanban Integration**: Built-in task board with drag-and-drop functionality
- **Priority & Tags**: Organize tasks with priorities, tags, and deadlines

### 🌐 Flexible Modes
- **Local-First**: Works completely offline with localStorage
- **Cloud Sync**: Optional Supabase integration for multi-device access
- **Public Sharing**: Share read-only maps via unique URLs

### 🔄 Multiple Views
- **Mind Map Canvas**: Draggable, zoomable node interface
- **Kanban Board**: Traditional task board view
- **Notes Outline**: Hierarchical text structure
- **Snapshot Mode**: Save and compare different versions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/aetherflow.git
   cd aetherflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional (for cloud features)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new project or select existing one
3. Generate an API key
4. Add it to your `.env.local` file

## 🗄️ Database Setup (Optional)

AetherFlow works in local-only mode by default. For cloud features:

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**
   ```sql
   -- Copy and paste the contents of supabase-setup.sql
   -- into your Supabase SQL editor
   ```

3. **Add environment variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Enable Row Level Security (RLS)**
   The schema includes all necessary RLS policies for secure multi-user access.

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── map/[id]/          # Dynamic map routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── canvas/           # Mind map canvas
│   ├── chat/             # AI chat interface
│   └── kanban/           # Task board
├── lib/                  # Utilities
│   ├── stores/           # Zustand state management
│   ├── supabase/         # Database client
│   ├── gemini/           # AI integration
│   └── utils/            # Helper functions
└── types/                # TypeScript definitions
```

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # Check TypeScript types
```

### Key Technologies

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom claymorphic utilities
- **State Management**: Zustand for reactive state
- **Database**: Supabase (PostgreSQL with real-time)
- **AI**: Google Gemini 2.0 Flash
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

## 🎯 Usage Guide

### Creating Your First Mind Map

1. **Start with an idea**: Enter any concept like "Start a podcast" or "Plan a vacation"
2. **AI Expansion**: Click the ⚡ icon to let AI break down your idea
3. **Manual Addition**: Use the ➕ icon to add your own nodes
4. **Chat & Explore**: Click 💬 to discuss ideas with AI
5. **Taskify**: Convert ideas to tasks with the ✅ icon

### Node Types

- **💡 Idea**: General concepts and brainstorming
- **✅ Task**: Actionable items with status tracking
- **📝 Note**: Additional information and context

### Keyboard Shortcuts

- **Space**: Toggle task status
- **Enter**: Expand selected node
- **Tab**: Switch between views
- **Escape**: Close modals/chat

### Export Options

- **PNG**: Visual mind map image
- **Markdown**: Structured text outline
- **JSON**: Complete data backup

## 🔧 Configuration

### Customizing AI Behavior

Edit `src/lib/gemini/client.ts` to modify AI prompts:

```typescript
// Customize expansion prompts
private buildExpansionPrompt(nodeTitle: string, nodeDescription?: string): string {
  return `Your custom prompt here...`
}
```

### Styling Customization

The claymorphic design system is defined in `tailwind.config.ts`:

```typescript
// Add custom claymorphic utilities
extend: {
  boxShadow: {
    'clay': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    'clay-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables** in Vercel dashboard
4. **Deploy**: Automatic deployment on every push

### Other Platforms

AetherFlow is a standard Next.js app and can be deployed on:
- Netlify
- Railway
- AWS Amplify
- Docker

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Demo**: [aetherflow.vercel.app](https://aetherflow.vercel.app)
- **Documentation**: [docs.aetherflow.app](https://docs.aetherflow.app)
- **Issues**: [GitHub Issues](https://github.com/your-username/aetherflow/issues)

## 🙏 Acknowledgments

- **Google Gemini**: For powering our AI features
- **Supabase**: For the excellent backend platform
- **Framer Motion**: For smooth animations
- **Tailwind CSS**: For the utility-first styling
- **Lucide**: For beautiful icons

---

**Built with ❤️ for creative minds everywhere**