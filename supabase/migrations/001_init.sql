-- ============================================================
-- VEESHAL.ME CMS — schema, RLS, realtime, storage
-- ============================================================

-- key/value settings (resume url, contact email, hero stats…)
create table if not exists public.site_settings (
    key text primary key,
    value jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
    id bigint generated always as identity primary key,
    label text not null,
    url text not null,
    sort int not null default 0,
    visible boolean not null default true
);

create table if not exists public.featured_projects (
    id bigint generated always as identity primary key,
    info text,
    name text not null,
    tag text,
    url text,
    video text,
    image text,
    hover_src text,
    sort int not null default 0,
    visible boolean not null default true
);

create table if not exists public.gallery (
    id bigint generated always as identity primary key,
    image_url text not null,
    alt text,
    sort int not null default 0,
    visible boolean not null default true
);

create table if not exists public.projects (
    id bigint generated always as identity primary key,
    title text not null,
    cat text not null default 'development',
    cat_label text,
    img text,
    description text,
    role text,
    stack text,
    year text,
    action text,
    url text,
    video text,
    image text,
    sort int not null default 0,
    visible boolean not null default true
);

create table if not exists public.skills (
    id bigint generated always as identity primary key,
    name text not null,
    icon_url text not null,
    sort int not null default 0,
    visible boolean not null default true
);

create table if not exists public.timeline_events (
    id bigint generated always as identity primary key,
    title text not null,
    description text,
    tag text,
    date_label text,
    images jsonb not null default '[]'::jsonb,
    sort int not null default 0,
    visible boolean not null default true
);

create table if not exists public.blogs (
    id bigint generated always as identity primary key,
    title text not null,
    slug text not null unique,
    category text,
    date_label text,
    image text,
    excerpt text,
    content_html text,
    is_static boolean not null default false,  -- true = rendered from existing PHP file
    sort int not null default 0,
    published boolean not null default true
);

-- ------------------------------------------------------------
-- RLS: anyone can read, only authenticated (CMS) can write
-- ------------------------------------------------------------
do $$
declare t text;
begin
    foreach t in array array['site_settings','social_links','featured_projects','gallery',
                             'projects','skills','timeline_events','blogs']
    loop
        execute format('alter table public.%I enable row level security', t);
        execute format('drop policy if exists "public read" on public.%I', t);
        execute format('create policy "public read" on public.%I for select using (true)', t);
        execute format('drop policy if exists "auth write" on public.%I', t);
        execute format('create policy "auth write" on public.%I for all to authenticated using (true) with check (true)', t);
    end loop;
end $$;

-- ------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------
do $$
declare t text;
begin
    foreach t in array array['site_settings','social_links','featured_projects','gallery',
                             'projects','skills','timeline_events','blogs']
    loop
        begin
            execute format('alter publication supabase_realtime add table public.%I', t);
        exception when duplicate_object then
            null;
        end;
    end loop;
end $$;

-- ------------------------------------------------------------
-- Storage: public "media" bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
    for select using (bucket_id = 'media');

drop policy if exists "auth manage media" on storage.objects;
create policy "auth manage media" on storage.objects
    for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
