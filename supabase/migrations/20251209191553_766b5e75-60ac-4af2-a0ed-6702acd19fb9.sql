-- Insert admin roles for the specified users
INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('622fd741-bb0b-4339-bc0b-a8c5af14c926', 'admin'),
  ('baf075c2-7530-4caa-bd0d-3282e7ddd53c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;