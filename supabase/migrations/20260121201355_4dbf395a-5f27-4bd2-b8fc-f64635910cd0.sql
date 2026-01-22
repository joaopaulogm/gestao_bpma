-- Remover cron jobs antigos (usando jobid)
DO $$
BEGIN
  PERFORM cron.unschedule(4);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule(5);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule(6);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Criar cron job para 11h (Brasília = 14h UTC)
SELECT cron.schedule(
  'sync-afastamentos-11h',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url:='https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/sync-afastamentos-sheets',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Criar cron job para 20h (Brasília = 23h UTC)
SELECT cron.schedule(
  'sync-afastamentos-20h',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url:='https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/sync-afastamentos-sheets',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
)