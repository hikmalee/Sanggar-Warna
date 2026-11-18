-- SANGGAR WARNA CREATIVE HUB
-- Jalankan melalui Supabase SQL Editor pada project baru.
-- Setelah membuat project, aktifkan Email Auth dan isi URL + anon key pada app.js.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'student' check (role in ('student','parent','tutor','admin')),
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  level text,
  age_group text,
  description text,
  tutor_name text,
  duration text,
  schedule_text text,
  mode text,
  price numeric default 0,
  quota integer,
  status text default 'Dibuka',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  parent_contact text,
  course_name text not null,
  note text,
  status text default 'Menunggu',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_name text not null,
  module text,
  type text,
  content_url text,
  description text,
  status text default 'Draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_name text not null,
  description text,
  due_date date,
  rubric text,
  status text default 'Aktif',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_name text,
  tutor_name text,
  event_date date not null,
  event_time text,
  location text,
  status text default 'Terjadwal',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  student_name text,
  category text,
  media_url text,
  description text,
  visibility text default 'Pribadi',
  moderation_status text default 'Menunggu',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text,
  category text,
  target text,
  requirements text,
  deadline date,
  official_url text,
  source text,
  verified_at date,
  status text default 'Perlu verifikasi',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text,
  benefit text,
  target text,
  requirements text,
  deadline date,
  official_url text,
  source text,
  verified_at date,
  status text default 'Perlu verifikasi',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  criteria text,
  badge_icon text,
  status text default 'Aktif',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  period text,
  attendance_summary text,
  strengths text,
  improvements text,
  recommendations text,
  status text default 'Draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  category text,
  message text not null,
  status text default 'Baru',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Trigger membuat profil otomatis setelah registrasi.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name','Pengguna Baru'),
    new.email,
    case when new.raw_user_meta_data->>'role' in ('student','parent','tutor')
      then new.raw_user_meta_data->>'role' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Row Level Security: baseline aman (default tertutup).
-- Kebijakan di bawah memberi akses baca data katalog kepada pengguna login,
-- dan akses tulis kepada admin. Untuk penggunaan produksi, lengkapi kebijakan
-- khusus per siswa/wali/tutor berdasarkan relasi kelas dan enrollment.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.status = 'Aktif');
$$;

alter table public.profiles enable row level security;
create policy "profile read self or admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());
create policy "profile update admin only" on public.profiles for update to authenticated
using (public.is_admin()) with check (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['courses','enrollments','materials','assignments','schedules','portfolio_items','opportunities','scholarships','achievements','progress_reports','support_tickets']
  loop
    execute format('alter table public.%I enable row level security',t);
    if t in ('courses','materials','opportunities','scholarships','achievements') then
      execute format('create policy "%s read catalog" on public.%I for select to authenticated using (true)',t,t);
    else
      execute format('create policy "%s read own or admin" on public.%I for select to authenticated using (created_by = auth.uid() or public.is_admin())',t,t);
    end if;
    execute format('create policy "%s insert authenticated" on public.%I for insert to authenticated with check (created_by = auth.uid() or public.is_admin())',t,t);
    execute format('create policy "%s update admin or creator" on public.%I for update to authenticated using (public.is_admin() or created_by = auth.uid()) with check (public.is_admin() or created_by = auth.uid())',t,t);
    execute format('create policy "%s delete admin or creator" on public.%I for delete to authenticated using (public.is_admin() or created_by = auth.uid())',t,t);
  end loop;
end $$;

-- PENTING UNTUK PRODUKSI:
-- 1. Jangan izinkan pengguna mengubah role dirinya sendiri dari student menjadi admin.
-- 2. Buat kebijakan granular untuk data siswa, wali, tutor, dan admin.
-- 3. Buat relasi parent_student_links dan student-course enrollment sebelum membuka data anak.
-- 4. Buat Supabase Storage bucket untuk karya/materi dengan policy akses privat.
-- 5. Uji seluruh policy dengan akun dari masing-masing role sebelum aplikasi dipublikasikan.
