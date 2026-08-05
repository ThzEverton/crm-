-- CRM Nutricionista — modelo PostgreSQL inicial
-- Pronto para PostgreSQL local, Neon ou Supabase.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type user_role as enum ('nutritionist', 'patient', 'assistant', 'admin');
create type appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
create type payment_status as enum ('pending', 'paid', 'overdue', 'refunded', 'cancelled');
create type payment_method as enum ('pix', 'card', 'cash', 'bank_slip', 'transfer');

create table clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  email citext unique,
  phone text,
  avatar_url text,
  notification_preferences jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  profile_id uuid unique references profiles(id) on delete set null,
  assigned_nutritionist_id uuid references profiles(id) on delete set null,
  full_name text not null,
  birth_date date,
  sex text,
  height_cm numeric(5,2),
  goal text,
  activity_level text,
  clinical_history text,
  dietary_restrictions text[],
  allergies text[],
  medications text[],
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_height_check check (height_cm is null or height_cm between 30 and 260)
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  nutritionist_id uuid references profiles(id) on delete set null,
  assessed_at timestamptz not null default now(),
  protocol text,
  weight_kg numeric(6,2),
  body_fat_percent numeric(5,2),
  lean_mass_kg numeric(6,2),
  fat_mass_kg numeric(6,2),
  body_water_percent numeric(5,2),
  bone_mass_kg numeric(5,2),
  muscle_mass_kg numeric(6,2),
  circumferences jsonb not null default '{}',
  skinfolds jsonb not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  constraint assessment_weight_check check (weight_kg is null or weight_kg between 1 and 500),
  constraint assessment_bf_check check (body_fat_percent is null or body_fat_percent between 1 and 80)
);

create table progress_photos (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete set null,
  angle text not null check (angle in ('front', 'back', 'right', 'left', 'other')),
  storage_path text not null,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table food_items (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid references clinics(id) on delete cascade,
  name text not null,
  brand text,
  source_code text,
  serving_grams numeric(8,2) not null default 100,
  household_measures jsonb not null default '[]',
  nutrients jsonb not null default '{}',
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  nutritionist_id uuid references profiles(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  starts_on date,
  ends_on date,
  targets jsonb not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans(id) on delete cascade,
  name text not null,
  scheduled_time time,
  position smallint not null,
  notes text,
  created_at timestamptz not null default now()
);

create table meal_foods (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  food_item_id uuid references food_items(id) on delete restrict,
  quantity_grams numeric(8,2),
  household_measure text,
  substitutions jsonb not null default '[]',
  position smallint not null,
  notes text
);

create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  meal_id uuid references meals(id) on delete set null,
  completed_at timestamptz,
  photo_path text,
  comment text,
  created_at timestamptz not null default now()
);

create table daily_feedbacks (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  feedback_date date not null,
  followed_plan smallint check (followed_plan between 0 and 10),
  hunger smallint check (hunger between 0 and 10),
  energy smallint check (energy between 0 and 10),
  sleep smallint check (sleep between 0 and 10),
  mood smallint check (mood between 0 and 10),
  water_ml integer,
  difficulty text,
  created_at timestamptz not null default now(),
  unique (patient_id, feedback_date)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  nutritionist_id uuid not null references profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  mode text not null check (mode in ('online', 'in_person')),
  status appointment_status not null default 'scheduled',
  appointment_type text,
  meeting_url text,
  notes text,
  created_at timestamptz not null default now(),
  constraint appointment_time_check check (ends_at > starts_at)
);

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  duration_months smallint not null check (duration_months > 0),
  consultation_count smallint,
  benefits jsonb not null default '[]',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table patient_subscriptions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  plan_id uuid references subscription_plans(id) on delete set null,
  starts_on date not null,
  ends_on date not null,
  agreed_price_cents integer not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  subscription_id uuid references patient_subscriptions(id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  due_date date not null,
  paid_at timestamptz,
  status payment_status not null default 'pending',
  method payment_method,
  external_reference text,
  receipt_path text,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  nutritionist_id uuid not null references profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_id, nutritionist_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text,
  attachment_path text,
  attachment_type text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint message_content_check check (body is not null or attachment_path is not null)
);

create index idx_patients_clinic on patients (clinic_id, status);
create index idx_assessments_patient_date on assessments (patient_id, assessed_at desc);
create index idx_appointments_professional_date on appointments (nutritionist_id, starts_at);
create index idx_payments_clinic_status_due on payments (clinic_id, status, due_date);
create index idx_messages_conversation_date on messages (conversation_id, created_at desc);
create index idx_feedbacks_patient_date on daily_feedbacks (patient_id, feedback_date desc);

-- Isolamento multiempresa: toda consulta deve filtrar clinic_id.
-- Em Supabase, habilite RLS e derive clinic_id do perfil autenticado.
