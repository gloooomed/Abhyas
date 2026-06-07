alter table public.profiles enable row level security;
alter table public.skills_scans enable row level security;
alter table public.resume_scores enable row level security;
alter table public.interview_sessions enable row level security;

alter table public.profiles force row level security;
alter table public.skills_scans force row level security;
alter table public.resume_scores force row level security;
alter table public.interview_sessions force row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

drop policy if exists "skills_scans_select_own" on public.skills_scans;
drop policy if exists "skills_scans_insert_own" on public.skills_scans;
drop policy if exists "skills_scans_update_own" on public.skills_scans;
drop policy if exists "skills_scans_delete_own" on public.skills_scans;

create policy "skills_scans_select_own" on public.skills_scans for select using (auth.uid() = user_id);
create policy "skills_scans_insert_own" on public.skills_scans for insert with check (auth.uid() = user_id);
create policy "skills_scans_update_own" on public.skills_scans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skills_scans_delete_own" on public.skills_scans for delete using (auth.uid() = user_id);

drop policy if exists "resume_scores_select_own" on public.resume_scores;
drop policy if exists "resume_scores_insert_own" on public.resume_scores;
drop policy if exists "resume_scores_update_own" on public.resume_scores;
drop policy if exists "resume_scores_delete_own" on public.resume_scores;

create policy "resume_scores_select_own" on public.resume_scores for select using (auth.uid() = user_id);
create policy "resume_scores_insert_own" on public.resume_scores for insert with check (auth.uid() = user_id);
create policy "resume_scores_update_own" on public.resume_scores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "resume_scores_delete_own" on public.resume_scores for delete using (auth.uid() = user_id);

drop policy if exists "interview_sessions_select_own" on public.interview_sessions;
drop policy if exists "interview_sessions_insert_own" on public.interview_sessions;
drop policy if exists "interview_sessions_update_own" on public.interview_sessions;
drop policy if exists "interview_sessions_delete_own" on public.interview_sessions;

create policy "interview_sessions_select_own" on public.interview_sessions for select using (auth.uid() = user_id);
create policy "interview_sessions_insert_own" on public.interview_sessions for insert with check (auth.uid() = user_id);
create policy "interview_sessions_update_own" on public.interview_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "interview_sessions_delete_own" on public.interview_sessions for delete using (auth.uid() = user_id);
