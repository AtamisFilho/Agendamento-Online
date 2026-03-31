-- ============================================================
-- RLS: PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: provider read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- RLS: SERVICES
-- ============================================================
alter table public.services enable row level security;

create policy "services: public read active"
  on public.services for select
  using (is_active = true);

create policy "services: provider full access"
  on public.services for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );

-- ============================================================
-- RLS: AVAILABILITY SLOTS
-- ============================================================
alter table public.availability_slots enable row level security;

create policy "slots: public read active"
  on public.availability_slots for select
  using (is_active = true);

create policy "slots: provider full access"
  on public.availability_slots for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );

-- ============================================================
-- RLS: APPOINTMENTS
-- ============================================================
alter table public.appointments enable row level security;

create policy "appointments: client own read"
  on public.appointments for select
  using (auth.uid() = client_id);

create policy "appointments: provider read all"
  on public.appointments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );

create policy "appointments: client insert"
  on public.appointments for insert
  with check (auth.uid() = client_id);

create policy "appointments: client cancel"
  on public.appointments for update
  using (auth.uid() = client_id)
  with check (
    auth.uid() = client_id
    and status in ('cancelled_by_client')
  );

create policy "appointments: provider update"
  on public.appointments for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );

-- ============================================================
-- RLS: NOTIFICATION LOG
-- ============================================================
alter table public.notification_log enable row level security;

create policy "notifications: provider read"
  on public.notification_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );

-- ============================================================
-- RLS: COMPANY SETTINGS
-- ============================================================
alter table public.company_settings enable row level security;

create policy "settings: public read"
  on public.company_settings for select using (true);

create policy "settings: provider update"
  on public.company_settings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'provider'
    )
  );
