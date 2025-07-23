create table episodes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  genre       text,
  audio_url   text not null,
  created_at  timestamp with time zone default now()
);
