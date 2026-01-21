
-- Schedule sync-afastamentos-sheets to run at 06:00 and 18:00 São Paulo time
-- São Paulo is UTC-3, so 06:00 SP = 09:00 UTC, 18:00 SP = 21:00 UTC

-- Remove existing jobs if any
SELECT cron.unschedule('sync-afastamentos-morning') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-afastamentos-morning'
);
SELECT cron.unschedule('sync-afastamentos-evening') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'sync-afastamentos-evening'
);

-- Schedule morning sync (06:00 São Paulo = 09:00 UTC)
SELECT cron.schedule(
  'sync-afastamentos-morning',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/sync-afastamentos-sheets',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule evening sync (18:00 São Paulo = 21:00 UTC)
SELECT cron.schedule(
  'sync-afastamentos-evening',
  '0 21 * * *',
  $$
  SELECT net.http_post(
    url := 'https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/sync-afastamentos-sheets',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
