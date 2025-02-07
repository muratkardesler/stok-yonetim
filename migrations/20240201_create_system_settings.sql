create table if not exists system_settings (
  id uuid primary key default uuid_generate_v4(),
  default_trial_period integer default 30,
  auto_deactivate_expired boolean default true,
  trial_end_notification_days integer default 7,
  notify_on_new_user boolean default true,
  require_admin_two_factor boolean default true,
  log_failed_login_attempts boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default settings if not exists
insert into system_settings (id)
select '00000000-0000-0000-0000-000000000000'
where not exists (select 1 from system_settings); 