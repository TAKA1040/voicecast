-- 既存のepisodesテーブルにuser_idカラムを追加（既に存在しない場合）
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'episodes' and column_name = 'user_id'
  ) then
    alter table episodes add column user_id uuid references auth.users(id);
  end if;
end $$;

-- Row Level Security (RLS) ポリシーを有効化（既に有効でない場合）
alter table episodes enable row level security;

-- 既存のポリシーを削除（存在する場合）
drop policy if exists "Users can view own episodes" on episodes;
drop policy if exists "Users can insert own episodes" on episodes;
drop policy if exists "Users can update own episodes" on episodes;
drop policy if exists "Users can delete own episodes" on episodes;

-- 新しいポリシーを作成
create policy "Users can view own episodes" on episodes
  for select using (auth.uid() = user_id);

create policy "Users can insert own episodes" on episodes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own episodes" on episodes
  for update using (auth.uid() = user_id);

create policy "Users can delete own episodes" on episodes
  for delete using (auth.uid() = user_id);