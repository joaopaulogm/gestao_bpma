-- Agendamento automático: Processar OS às 08:00 e 18:00 horário de Brasília
-- (11:00 e 21:00 UTC)

-- Criar cron job para sync de OS às 08:00 (11:00 UTC)
SELECT cron.schedule(
  'sync-os-08h',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url:='https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/process-os-folder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
    body:='{"action": "process", "year": 2026, "limit": 5, "scheduled": true}'::jsonb
  ) as request_id;
  $$
);

-- Criar cron job para sync de OS às 18:00 (21:00 UTC)
SELECT cron.schedule(
  'sync-os-18h',
  '0 21 * * *',
  $$
  SELECT net.http_post(
    url:='https://oiwwptnqaunsyhpkwbrz.supabase.co/functions/v1/process-os-folder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pd3dwdG5xYXVuc3locGt3YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjI2MzQsImV4cCI6MjA1NjMzODYzNH0.lK5-KS8bxrtQYJsCRNOeeqBS-9Fn0MMsIdolhkeApuE"}'::jsonb,
    body:='{"action": "process", "year": 2026, "limit": 5, "scheduled": true}'::jsonb
  ) as request_id;
  $$
);