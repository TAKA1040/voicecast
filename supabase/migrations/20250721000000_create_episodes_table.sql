create table episodes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  genre       text,
  audio_url   text not null,
  user_id     uuid references auth.users(id) not null,
  created_at  timestamp with time zone default now()
);

-- Row Level Security (RLS) ポリシーを有効化
alter table episodes enable row level security;

-- ユーザーは自分のエピソードのみ表示・操作可能
create policy "Users can view own episodes" on episodes
  for select using (auth.uid() = user_id);

create policy "Users can insert own episodes" on episodes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own episodes" on episodes
  for update using (auth.uid() = user_id);

create policy "Users can delete own episodes" on episodes
  for delete using (auth.uid() = user_id);
