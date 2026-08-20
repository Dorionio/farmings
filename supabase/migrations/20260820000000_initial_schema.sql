-- Create Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'trialing',
    trial_end TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'staff',
    phone TEXT,
    photo_url TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Invites table
CREATE TABLE IF NOT EXISTS invites (
    code TEXT PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Animals table
CREATE TABLE IF NOT EXISTS animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    date_of_birth DATE,
    sex TEXT CHECK (sex IN ('male', 'female')),
    photo_url TEXT,
    microchip_id TEXT,
    is_boarding BOOLEAN DEFAULT false,
    is_breeding BOOLEAN DEFAULT false,
    owner_name TEXT,
    owner_contact TEXT,
    check_in_date TIMESTAMPTZ,
    check_out_date TIMESTAMPTZ,
    kennel_run TEXT,
    special_care TEXT,
    sire_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    dam_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    sire_name TEXT,
    dam_name TEXT,
    breeding_status TEXT DEFAULT 'active',
    breeding_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Kennels table
CREATE TABLE IF NOT EXISTS kennels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    current_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    current_animal_name TEXT,
    notes TEXT
);

-- Create Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    animal_name TEXT,
    type TEXT NOT NULL,
    date_given DATE NOT NULL,
    next_due_date DATE
);

-- Create Vet Visits table
CREATE TABLE IF NOT EXISTS vet_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    animal_name TEXT,
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    file_url TEXT
);

-- Create Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    animal_name TEXT,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    schedule TEXT NOT NULL,
    status TEXT DEFAULT 'active'
);

-- Create Weight Records table
CREATE TABLE IF NOT EXISTS weight_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight NUMERIC(6, 2) NOT NULL
);

-- Create Care Schedules table
CREATE TABLE IF NOT EXISTS care_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    animal_name TEXT,
    task_name TEXT NOT NULL,
    schedule TEXT NOT NULL,
    notes TEXT
);

-- Create Care Logs table
CREATE TABLE IF NOT EXISTS care_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    animal_name TEXT,
    task_name TEXT NOT NULL,
    schedule TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now(),
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completed_by_name TEXT,
    date DATE NOT NULL
);

-- Create Heat Cycles table
CREATE TABLE IF NOT EXISTS heat_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    notes TEXT
);

-- Create Mating Records table
CREATE TABLE IF NOT EXISTS mating_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sire_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    sire_name TEXT,
    dam_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    dam_name TEXT,
    notes TEXT
);

-- Create Pregnancy Records table
CREATE TABLE IF NOT EXISTS pregnancy_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dam_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    mating_record_id UUID REFERENCES mating_records(id) ON DELETE SET NULL,
    expected_due_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT
);

-- Create Litters table
CREATE TABLE IF NOT EXISTS litters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dam_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    sire_id UUID REFERENCES animals(id) ON DELETE SET NULL,
    pregnancy_record_id UUID REFERENCES pregnancy_records(id) ON DELETE SET NULL,
    birth_date DATE NOT NULL,
    offspring_count INTEGER NOT NULL,
    notes TEXT,
    offspring_ids TEXT[] DEFAULT '{}'::TEXT[]
);
