
-- ==========================================
-- ZERAVA FILMBOARD DATABASE
-- Supabase / PostgreSQL
-- ==========================================

create extension if not exists pgcrypto;

-- 1. MEMBER PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text default '',
  job text default 'Filmmaker',
  avatar_url text,
  bio text default '',
  is_online boolean default false,
  created_at timestamptz default now()
);

-- Create profile automatically after registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, username, full_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 2. COMMUNITY SERVERS
create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.server_members (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member'
    check(role in ('owner','admin','moderator','member')),
  created_at timestamptz default now(),
  unique(server_id,user_id)
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete cascade,
  name text not null,
  description text default '',
  channel_type text default 'text',
  created_at timestamptz default now()
);

-- 3. CHAT
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key(conversation_id,user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  content text default '',
  attachment_url text,
  created_at timestamptz default now()
);

-- 4. FILM PROJECTS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  genre text default '',
  project_type text default 'Short Film',
  status text default 'Development',
  progress integer default 0 check(progress between 0 and 100),
  owner_id uuid references public.profiles(id) on delete set null,
  server_id uuid references public.servers(id) on delete set null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  job text default 'Crew',
  primary key(project_id,user_id)
);

create table if not exists public.production_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date timestamptz,
  status text default 'todo',
  created_at timestamptz default now()
);

create table if not exists public.shot_lists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  shot_number integer,
  scene text,
  shot_type text,
  description text,
  reference_url text,
  created_at timestamptz default now()
);

-- 5. FILM ACADEMY
create table if not exists public.academy_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'General',
  content text default '',
  media_url text,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 6. COMMUNITY FEED
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  media_url text,
  created_at timestamptz default now()
);

create table if not exists public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key(post_id,user_id)
);

-- 7. PRODUCTION GALLERY
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  media_url text not null,
  caption text default '',
  media_type text default 'image',
  created_at timestamptz default now()
);

-- 8. BOOKMARKS
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  material_id uuid references public.academy_materials(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id,material_id)
);

-- 9. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text default '',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.profiles enable row level security;
alter table public.servers enable row level security;
alter table public.server_members enable row level security;
alter table public.channels enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.production_tasks enable row level security;
alter table public.shot_lists enable row level security;
alter table public.academy_materials enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.gallery enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;

-- Profiles
create policy "Profiles visible to everyone"
on public.profiles for select using (true);

create policy "Users update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Servers
create policy "Servers visible"
on public.servers for select using (true);

create policy "Authenticated users create servers"
on public.servers for insert
with check (auth.uid() = owner_id);

create policy "Owners update servers"
on public.servers for update
using (auth.uid() = owner_id);

create policy "Owners delete servers"
on public.servers for delete
using (auth.uid() = owner_id);

-- Server members
create policy "Members visible"
on public.server_members for select using (true);

create policy "Users join servers"
on public.server_members for insert
with check (auth.uid() = user_id);

create policy "Users leave servers"
on public.server_members for delete
using (auth.uid() = user_id);

-- Channels
create policy "Channels visible"
on public.channels for select using (true);

create policy "Authenticated create channels"
on public.channels for insert
with check (auth.uid() is not null);

-- Conversations
create policy "Conversation members read"
on public.conversations for select
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = id and cm.user_id = auth.uid()
  )
);

create policy "Authenticated create conversations"
on public.conversations for insert
with check (auth.uid() = created_by);

create policy "Members visible in conversations"
on public.conversation_members for select
using (user_id = auth.uid());

create policy "Authenticated add conversation members"
on public.conversation_members for insert
with check (auth.uid() is not null);

-- Messages
create policy "Conversation members read messages"
on public.messages for select
using (
  exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversation_id
    and cm.user_id = auth.uid()
  )
);

create policy "Conversation members send messages"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = conversation_id
    and cm.user_id = auth.uid()
  )
);

-- Projects
create policy "Projects visible"
on public.projects for select using (true);

create policy "Authenticated create projects"
on public.projects for insert
with check (auth.uid() = owner_id);

create policy "Project owners update"
on public.projects for update
using (auth.uid() = owner_id);

create policy "Project owners delete"
on public.projects for delete
using (auth.uid() = owner_id);

create policy "Project members visible"
on public.project_members for select using (true);

create policy "Authenticated add project members"
on public.project_members for insert
with check (auth.uid() is not null);

-- Production tasks
create policy "Tasks visible"
on public.production_tasks for select using (true);

create policy "Authenticated create tasks"
on public.production_tasks for insert
with check (auth.uid() is not null);

create policy "Authenticated update tasks"
on public.production_tasks for update
using (auth.uid() is not null);

-- Shot lists
create policy "Shot lists visible"
on public.shot_lists for select using (true);

create policy "Authenticated create shot lists"
on public.shot_lists for insert
with check (auth.uid() is not null);

-- Academy
create policy "Academy visible"
on public.academy_materials for select using (true);

create policy "Authenticated share academy"
on public.academy_materials for insert
with check (auth.uid() = author_id);

create policy "Authors update academy"
on public.academy_materials for update
using (auth.uid() = author_id);

create policy "Authors delete academy"
on public.academy_materials for delete
using (auth.uid() = author_id);

-- Posts
create policy "Posts visible"
on public.posts for select using (true);

create policy "Authenticated create posts"
on public.posts for insert
with check (auth.uid() = author_id);

create policy "Authors update posts"
on public.posts for update
using (auth.uid() = author_id);

create policy "Authors delete posts"
on public.posts for delete
using (auth.uid() = author_id);

-- Likes
create policy "Likes visible"
on public.post_likes for select using (true);

create policy "Users like posts"
on public.post_likes for insert
with check (auth.uid() = user_id);

create policy "Users unlike posts"
on public.post_likes for delete
using (auth.uid() = user_id);

-- Gallery
create policy "Gallery visible"
on public.gallery for select using (true);

create policy "Authenticated upload gallery metadata"
on public.gallery for insert
with check (auth.uid() = author_id);

create policy "Authors delete gallery metadata"
on public.gallery for delete
using (auth.uid() = author_id);

-- Bookmarks
create policy "Users read own bookmarks"
on public.bookmarks for select
using (auth.uid() = user_id);

create policy "Users create own bookmarks"
on public.bookmarks for insert
with check (auth.uid() = user_id);

create policy "Users delete own bookmarks"
on public.bookmarks for delete
using (auth.uid() = user_id);

-- Notifications
create policy "Users read own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "Users update own notifications"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.notifications;
