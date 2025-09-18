# Project Prompt: AetherFlow

You are building a production-ready web application called **AetherFlow**.

## Core Objective
AetherFlow is an **AI-powered expanding mind map + task board**.  
Users start with a single idea or project, expand it recursively using **Gemini-2.5-Flash**, brainstorm via inline chats, add manual notes, and finally convert any node into actionable tasks managed inside a Kanban board.  

The experience should feel fluid, playful, and modern, with a **claymorphism-inspired interface** (soft, tactile UI with depth, blur, and subtle shadows).

---

## Key Features

### 1. Idea Expansion
- User provides a **seed idea** (e.g., “Start a podcast”, “Trip to Japan”).
- Gemini-2.5-Flash generates structured **child nodes** with categories, subtasks, risks, and resources.
- Nodes should be **expandable recursively**:
  - **AI Expansion**: auto-generate deeper breakdowns.
  - **Chat Expansion**: inline conversational mode with Gemini for deeper brainstorming.  
  - **Manual Expansion**: users can add their own subnodes or notes.

### 2. Node Capabilities
- **Editable title/description**.  
- **Inline notes panel** (editable, synced).  
- **Option to "Taskify"** → convert node into a task card.  
- Task cards include:
  - Title, notes, priority, tags, deadline.  
  - Tasks automatically sync to Kanban view.  

### 3. Kanban Board
- Nodes converted into tasks appear in a **Kanban board**.  
- Columns: To Do, In Progress, Done (configurable later).  
- Supports drag & drop, editing, progress tracking.  

### 4. Views
- **Mind Map View**: draggable, claymorphic bubbles with animated connections.  
- **Task Board View**: Kanban-style board synced to map.  
- **Notes View**: outlines all nodes and subnodes as nested Markdown-like structure.  
- **Snapshot Mode**: freeze a version of the map for reference.  

### 5. Collaboration & Persistence
- **Without login**: fully works in local storage.  
- **With Supabase credentials provided in Vercel envs**:
  - User accounts via Supabase Auth.  
  - Save/load multiple maps.  
  - Public sharing via unique slug → read-only shared map view.  

### 6. Export & Sharing
- Export mind map as **PNG image**.  
- Export structured outline as **Markdown**.  
- Export data as **JSON** for backup/re-import.  
- Shareable public URL (read-only map preview).  

---

## Core Interactions

1. **Landing Page**
   - Friendly tagline and claymorphic CTA to “Start a Map”.
   - Option to log in (if Supabase envs exist).

2. **Map Editor**
   - Canvas of draggable claymorphic bubbles.  
   - Hover → quick actions: expand, chat, add manually, taskify.  
   - Inline chat dock opens when user requests brainstorm.  
   - Save snapshots.

3. **Kanban Board**
   - Auto-populated from “taskified” nodes.  
   - Editable cards; drag across columns.  

4. **Chat Integration**
   - Gemini-2.5-Flash is called in two contexts:  
     - **Expansion Prompt**: expand a node with structured subtasks.  
     - **Chat Prompt**: free-flow user ↔ AI conversation, results can be accepted into node notes/tasks.  

---

## Reliability & Guardrails

- **LLM**: Always enforce valid structured JSON responses when requesting expansions.  
- **Retries**: On malformed output, retry once with a schema reminder.  
- **Fallback**: If Gemini fails, create 3 generic child nodes manually.  
- **Persistence**: Auto-save to Local Storage; if Supabase envs exist, sync to DB.  

---

## Branding & UX

- **Design Language**: Claymorphism-inspired (soft shapes, depth, blur, neumorphic lighting).  
- **Animations**: Smooth transitions when expanding/collapsing nodes.  
- **Accessibility**: High-contrast mode toggle, keyboard shortcuts (Enter to expand, Space to toggle task, Tab to switch views).  
- **Playful Touches**: Subtle haptic-like feedback when dragging/dropping or taskifying.  

---

## Data Model (Conceptual)

- **User**: if Supabase is present.  
- **Map**: title, created_at, updated_at.  
- **Node**: id, parent_id, type (idea/task/note), title, description, metadata, order.  
- **Task**: if node is taskified → deadline, priority, tags, status.  
- **Snapshot**: frozen version of a map with timestamp.  

---

## Environment Variables

App must only require the user to set the following in Vercel:

```
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

If Supabase vars are missing, the app runs in local-only mode.

---

## Development Notes for Claude

- **MEGATHINK directive**: deeply research and decide the most appropriate stack, libraries, and architecture. Do not assume defaults.  
- Focus on delivering **production-ready**, **deployable on Vercel**.  
- Ensure Gemini calls are **server-side only**.  
- Deliver a **polished, reliable app** with all the above features, respecting the claymorphism design language.  

---

End of prompt.