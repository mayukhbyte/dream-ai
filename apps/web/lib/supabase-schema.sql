-- =========================================================
-- DreamFood AI - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (supabase.com/dashboard)
-- =========================================================

-- 1. ORDERS TABLE (Linked to Firebase / User UID)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT,
    dish TEXT NOT NULL,
    restaurant TEXT NOT NULL,
    price TEXT NOT NULL,
    quality_score INT DEFAULT 95,
    hot_probability INT DEFAULT 95,
    delivery_mode TEXT DEFAULT 'fast',
    eta TEXT DEFAULT '20 mins',
    status TEXT DEFAULT 'PREPARING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 2. FOOD MEMORY & CRAVING HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.food_memory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    query TEXT NOT NULL,
    matched_dish TEXT NOT NULL,
    quality_score INT DEFAULT 95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_memory_user_id ON public.food_memory(user_id);

-- 3. CUSTOM MEALS TABLE (Build My Meal)
CREATE TABLE IF NOT EXISTS public.custom_meals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    base TEXT NOT NULL,
    protein TEXT NOT NULL,
    side TEXT NOT NULL,
    drink TEXT NOT NULL,
    price TEXT DEFAULT '₹320',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_meals_user_id ON public.custom_meals(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_meals ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read and insert for the web application
CREATE POLICY "Allow anon insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select orders" ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow anon insert food_memory" ON public.food_memory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select food_memory" ON public.food_memory FOR SELECT USING (true);

CREATE POLICY "Allow anon insert custom_meals" ON public.custom_meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select custom_meals" ON public.custom_meals FOR SELECT USING (true);
