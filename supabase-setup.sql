-- AetherFlow Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maps table
CREATE TABLE IF NOT EXISTS public.maps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nodes table
CREATE TABLE IF NOT EXISTS public.nodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('idea', 'task', 'note')) NOT NULL DEFAULT 'idea',
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    position JSONB DEFAULT '{"x": 0, "y": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    node_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) NOT NULL DEFAULT 'todo',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) NOT NULL DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create snapshots table
CREATE TABLE IF NOT EXISTS public.snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    map_id UUID REFERENCES public.maps(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maps_user_id ON public.maps(user_id);
CREATE INDEX IF NOT EXISTS idx_maps_slug ON public.maps(slug);
CREATE INDEX IF NOT EXISTS idx_nodes_map_id ON public.nodes(map_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON public.nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_node_id ON public.tasks(node_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_map_id ON public.snapshots(map_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for maps table
CREATE POLICY "maps_select_accessible" ON public.maps
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "maps_insert_own" ON public.maps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "maps_update_own" ON public.maps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "maps_delete_own" ON public.maps
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for nodes table
CREATE POLICY "nodes_select_accessible" ON public.nodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = nodes.map_id
            AND (maps.user_id = auth.uid() OR maps.is_public = TRUE)
        )
    );

CREATE POLICY "nodes_insert_own_maps" ON public.nodes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = nodes.map_id
            AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "nodes_update_own_maps" ON public.nodes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = nodes.map_id
            AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "nodes_delete_own_maps" ON public.nodes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = nodes.map_id
            AND maps.user_id = auth.uid()
        )
    );

-- RLS Policies for tasks table
CREATE POLICY "tasks_select_accessible" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.nodes
            JOIN public.maps ON maps.id = nodes.map_id
            WHERE nodes.id = tasks.node_id
            AND (maps.user_id = auth.uid() OR maps.is_public = TRUE)
        )
    );

CREATE POLICY "tasks_insert_own_maps" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.nodes
            JOIN public.maps ON maps.id = nodes.map_id
            WHERE nodes.id = tasks.node_id
            AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "tasks_update_own_maps" ON public.tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.nodes
            JOIN public.maps ON maps.id = nodes.map_id
            WHERE nodes.id = tasks.node_id
            AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "tasks_delete_own_maps" ON public.tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.nodes
            JOIN public.maps ON maps.id = nodes.map_id
            WHERE nodes.id = tasks.node_id
            AND maps.user_id = auth.uid()
        )
    );

-- RLS Policies for snapshots table
CREATE POLICY "snapshots_select_accessible" ON public.snapshots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = snapshots.map_id
            AND (maps.user_id = auth.uid() OR maps.is_public = TRUE)
        )
    );

CREATE POLICY "snapshots_insert_own_maps" ON public.snapshots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = snapshots.map_id
            AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "snapshots_delete_own_maps" ON public.snapshots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = snapshots.map_id
            AND maps.user_id = auth.uid()
        )
    );

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_maps_updated_at
    BEFORE UPDATE ON public.maps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_nodes_updated_at
    BEFORE UPDATE ON public.nodes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();