-- Schema Supabase PostgreSQL cho Game Sử Việt (Pure Cloud Save)

-- 1. Bảng Hồ Sơ Người Chơi (Player Profiles)
CREATE TABLE IF NOT EXISTS public.player_profiles (
    id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL DEFAULT 'Anh Hùng Sử Việt',
    gold BIGINT NOT NULL DEFAULT 5000,
    current_stage INT NOT NULL DEFAULT 0,
    max_unlocked_stage INT NOT NULL DEFAULT 0,
    tower_floor INT NOT NULL DEFAULT 1,
    max_tower_floor INT NOT NULL DEFAULT 1,
    pvp_score INT NOT NULL DEFAULT 1250,
    world_boss_total_damage BIGINT NOT NULL DEFAULT 0,
    active_beast_id TEXT NOT NULL DEFAULT 'beast_kim_quy',
    full_state_json JSONB DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nâng cấp/Bổ sung cột tự động cho các bảng đã khởi tạo từ trước (Migration Safe)
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS tower_floor INT NOT NULL DEFAULT 1;
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS max_tower_floor INT NOT NULL DEFAULT 1;
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS pvp_score INT NOT NULL DEFAULT 1250;
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS world_boss_total_damage BIGINT NOT NULL DEFAULT 0;
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS active_beast_id TEXT NOT NULL DEFAULT 'beast_kim_quy';
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS full_state_json JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Bảng Tướng Sở Hữu (Player Heroes)
CREATE TABLE IF NOT EXISTS public.player_heroes (
    id TEXT PRIMARY KEY,
    player_id TEXT REFERENCES public.player_profiles(id) ON DELETE CASCADE,
    hero_name TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'SR',
    level INT NOT NULL DEFAULT 1,
    stars INT NOT NULL DEFAULT 1,
    slot_index INT NOT NULL DEFAULT -1,
    equipped_item_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Mảnh Tướng (Player Hero Shards)
CREATE TABLE IF NOT EXISTS public.player_shards (
    id SERIAL PRIMARY KEY,
    player_id TEXT REFERENCES public.player_profiles(id) ON DELETE CASCADE,
    hero_name TEXT NOT NULL,
    count INT NOT NULL DEFAULT 0
);

-- Bổ sung ràng buộc Unique cho Mảnh Tướng nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'player_shards_player_id_hero_name_key'
    ) THEN
        ALTER TABLE public.player_shards ADD CONSTRAINT player_shards_player_id_hero_name_key UNIQUE (player_id, hero_name);
    END IF;
END $$;

-- Row Level Security (RLS): always on for these tables.
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_shards ENABLE ROW LEVEL SECURITY;

-- Owner-only policies, grants and the leaderboard view live in
-- supabase/migrations/20261125060000_s11_rls_leaderboard_view.sql (owner-only, S-11).
-- Do not re-add open USING (true) policies or GRANT ALL to anon here.
