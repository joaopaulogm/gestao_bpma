-- Schedule sync-afastamentos-sheets to run every hour at minute 0
SELECT cron.schedule(
  'sync-afastamentos-sheets-hourly',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/sync-afastamentos-sheets',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) AS request_id;
  $$
);