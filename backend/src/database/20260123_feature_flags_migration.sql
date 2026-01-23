
-- V3.0 FEATURE FLAG SYSTEM MIGRATION
-- This script sets up the infrastructure for real-time feature toggling and staggered rollouts.

-- 1. FEATURE FLAGS CONFIGURATION
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key TEXT PRIMARY KEY,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    enabled_env TEXT[] NOT NULL DEFAULT '{production}',
    enabled_roles TEXT[] NOT NULL DEFAULT '{admin}',
    rollout_percent INTEGER DEFAULT 0 CHECK (rollout_percent >= 0 AND rollout_percent <= 100),
    introduced_version TEXT,
    is_core BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. APPEND-ONLY AUDIT TRAIL (v3 Principle)
CREATE TABLE IF NOT EXISTS public.feature_flag_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    reason TEXT NOT NULL,
    actor UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_audit ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Everyone can read flags to evaluate them locally
DROP POLICY IF EXISTS "authenticated_can_read_flags" ON public.feature_flags;
CREATE POLICY "authenticated_can_read_flags" 
ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- Only Admin/CEO/OPS can modify flags
DROP POLICY IF EXISTS "admins_can_manage_flags" ON public.feature_flags;
CREATE POLICY "admins_can_manage_flags" 
ON public.feature_flags FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.staff_master 
    WHERE id = auth.uid() AND (role = 'ADMIN' OR role = 'CEO' OR role = 'OPS')
));

-- 5. INITIAL SEED (GLOBAL KILL SWITCH)
INSERT INTO public.feature_flags (key, description, enabled, is_core, enabled_env, enabled_roles)
VALUES (
    'GLOBAL_FEATURE_KILL_SWITCH', 
    'Emergency safety valve. When ON, all non-core features are forced to DISABLED.', 
    false, 
    true, 
    '{production,staging}', 
    '{admin,ceo}'
)
ON CONFLICT (key) DO UPDATE 
SET description = EXCLUDED.description, is_core = true;

-- 6. SAMPLE FEATURE: OPS INTELLIGENCE
INSERT INTO public.feature_flags (key, description, enabled, enabled_env, enabled_roles, rollout_percent)
VALUES (
    'OPS_INTELLIGENCE_ENGINE', 
    'The v3 decision engine for rule-based operational analysis.', 
    false, 
    '{staging}', 
    '{admin,ceo,ops}', 
    10
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE feature_flags IS 'Configuration for v3.0 Staggered Rollouts and Feature Toggling.';
COMMENT ON TABLE feature_flag_audit IS 'Audit trail for all feature flag changes (v3 Traceability).';
