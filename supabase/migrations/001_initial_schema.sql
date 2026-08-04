-- ====================================================================
-- CropPilot AI - Full PostgreSQL Database Schema with Row Level Security (RLS)
-- Migration File: supabase/migrations/001_initial_schema.sql
-- ====================================================================

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. Table Definitions & Constraints
-- ====================================================================

-- 1.1 Farmers / Users Profile Table (Linked to Auth.Users)
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    location TEXT,
    preferred_language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    location_address TEXT,
    total_area_acres NUMERIC(10, 2) DEFAULT 0.00,
    soil_type TEXT, -- e.g., 'Clay', 'Sandy', 'Loam', 'Silt', 'Black Soil'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 Fields Table
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    field_name TEXT NOT NULL,
    area_acres NUMERIC(10, 2) DEFAULT 0.00,
    irrigation_type TEXT DEFAULT 'rainfed' CHECK (irrigation_type IN ('drip', 'sprinkler', 'canal', 'borewell', 'rainfed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 Crops Table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    crop_name TEXT NOT NULL, -- e.g., 'Wheat', 'Rice', 'Cotton', 'Maize', 'Tomato'
    variety TEXT,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    status TEXT NOT NULL DEFAULT 'sown' CHECK (status IN ('planned', 'sown', 'growing', 'harvested', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 Crop Advisories Table (AI-Powered Crop Recommendations)
CREATE TABLE IF NOT EXISTS public.crop_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    advisory_title TEXT NOT NULL,
    advisory_content TEXT NOT NULL,
    severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    weather_condition TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 2. Performance Optimization Indexes
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_farmers_id ON public.farmers(id);
CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_farmer_id ON public.fields(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON public.crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_advisories_crop_id ON public.crop_advisories(crop_id);
CREATE INDEX IF NOT EXISTS idx_advisories_farmer_id ON public.crop_advisories(farmer_id);

-- ====================================================================
-- 3. Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_advisories ENABLE ROW LEVEL SECURITY;

-- 3.1 Farmers RLS Policies
CREATE POLICY "Farmers can view own profile" ON public.farmers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Farmers can insert own profile" ON public.farmers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Farmers can update own profile" ON public.farmers FOR UPDATE USING (auth.uid() = id);

-- 3.2 Farms RLS Policies
CREATE POLICY "Farmers can view own farms" ON public.farms FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own farms" ON public.farms FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own farms" ON public.farms FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own farms" ON public.farms FOR DELETE USING (auth.uid() = farmer_id);

-- 3.3 Fields RLS Policies
CREATE POLICY "Farmers can view own fields" ON public.fields FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own fields" ON public.fields FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own fields" ON public.fields FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own fields" ON public.fields FOR DELETE USING (auth.uid() = farmer_id);

-- 3.4 Crops RLS Policies
CREATE POLICY "Farmers can view own crops" ON public.crops FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own crops" ON public.crops FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own crops" ON public.crops FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own crops" ON public.crops FOR DELETE USING (auth.uid() = farmer_id);

-- 3.5 Crop Advisories RLS Policies
CREATE POLICY "Farmers can view own advisories" ON public.crop_advisories FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can insert own advisories" ON public.crop_advisories FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own advisories" ON public.crop_advisories FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own advisories" ON public.crop_advisories FOR DELETE USING (auth.uid() = farmer_id);

-- ====================================================================
-- 4. Automated Updated-At Timestamp Triggers
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_farmers_updated_at BEFORE UPDATE ON public.farmers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
