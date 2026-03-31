-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type user_role as enum ('client', 'provider');
create type appointment_status as enum (
  'pending', 'confirmed', 'cancelled_by_client',
  'cancelled_by_provider', 'completed', 'no_show'
);
create type slot_recurrence as enum ('none', 'daily', 'weekly');
create type notification_type as enum (
  'confirmation', 'reminder', 'cancellation', 'rescheduled'
);
create type notification_channel as enum ('email', 'sms');
create type notification_status as enum ('pending', 'sent', 'failed');

-- ============================================================
-- PROFILES (extends auth.users 1:1)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role        not null default 'client',
  full_name     text             not null,
  phone         text,
  avatar_url    text,
  created_at    timestamptz      not null default now(),
  updated_at    timestamptz      not null default now()
);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SERVICES
-- ============================================================
create table public.services (
  id              uuid        primary key default uuid_generate_v4(),
  name            text        not null,
  description     text,
  duration_minutes int        not null check (duration_minutes > 0),
  price_cents     int         not null default 0 check (price_cents >= 0),
  color           text        not null default '#6366f1',
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- AVAILABILITY SLOTS
-- ============================================================
create table public.availability_slots (
  id              uuid        primary key default uuid_generate_v4(),
  provider_id     uuid        not null references public.profiles(id) on delete cascade,
  service_id      uuid        references public.services(id) on delete set null,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null check (ends_at > starts_at),
  recurrence      slot_recurrence not null default 'none',
  recurrence_end  date,
  max_bookings    int         not null default 1,
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint valid_recurrence_end check (
    recurrence = 'none' or recurrence_end is not null
  )
);

create index idx_availability_slots_starts_at on public.availability_slots(starts_at);
create index idx_availability_slots_provider  on public.availability_slots(provider_id);
create index idx_availability_slots_service   on public.availability_slots(service_id);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
create table public.appointments (
  id              uuid               primary key default uuid_generate_v4(),
  client_id       uuid               not null references public.profiles(id) on delete restrict,
  provider_id     uuid               not null references public.profiles(id) on delete restrict,
  service_id      uuid               not null references public.services(id) on delete restrict,
  slot_id         uuid               references public.availability_slots(id) on delete set null,
  starts_at       timestamptz        not null,
  ends_at         timestamptz        not null check (ends_at > starts_at),
  status          appointment_status not null default 'pending',
  notes           text,
  internal_notes  text,
  cancelled_at    timestamptz,
  cancellation_reason text,
  created_at      timestamptz        not null default now(),
  updated_at      timestamptz        not null default now()
);

create index idx_appointments_client     on public.appointments(client_id);
create index idx_appointments_provider   on public.appointments(provider_id);
create index idx_appointments_starts_at  on public.appointments(starts_at);
create index idx_appointments_status     on public.appointments(status);

-- Prevent double-booking
create or replace function public.check_slot_availability()
returns trigger language plpgsql as $$
declare
  current_bookings int;
  slot_max int;
begin
  if new.slot_id is null then
    return new;
  end if;

  select max_bookings into slot_max
  from public.availability_slots
  where id = new.slot_id;

  select count(*) into current_bookings
  from public.appointments
  where slot_id = new.slot_id
    and status not in ('cancelled_by_client', 'cancelled_by_provider')
    and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if current_bookings >= slot_max then
    raise exception 'Slot is fully booked';
  end if;

  return new;
end;
$$;

create trigger trg_check_slot_availability
  before insert or update on public.appointments
  for each row execute procedure public.check_slot_availability();

-- ============================================================
-- NOTIFICATION LOG
-- ============================================================
create table public.notification_log (
  id              uuid                 primary key default uuid_generate_v4(),
  appointment_id  uuid                 not null references public.appointments(id) on delete cascade,
  type            notification_type    not null,
  channel         notification_channel not null default 'email',
  recipient_email text,
  status          notification_status  not null default 'pending',
  provider_message_id text,
  error_message   text,
  scheduled_for   timestamptz,
  sent_at         timestamptz,
  created_at      timestamptz          not null default now()
);

create index idx_notification_log_appointment on public.notification_log(appointment_id);
create index idx_notification_log_scheduled   on public.notification_log(scheduled_for)
  where status = 'pending';

-- ============================================================
-- COMPANY SETTINGS (singleton)
-- ============================================================
create table public.company_settings (
  id               int  primary key default 1 check (id = 1),
  name             text not null default 'Minha Empresa',
  logo_url         text,
  primary_color    text not null default '#6366f1',
  booking_lead_hours int not null default 2,
  cancellation_hours int not null default 24,
  reminder_hours   int  not null default 24,
  timezone         text not null default 'America/Sao_Paulo',
  contact_email    text,
  contact_phone    text,
  address          text,
  updated_at       timestamptz not null default now()
);

insert into public.company_settings (id) values (1);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_services
  before update on public.services
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_availability_slots
  before update on public.availability_slots
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_appointments
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_company_settings
  before update on public.company_settings
  for each row execute procedure public.set_updated_at();
