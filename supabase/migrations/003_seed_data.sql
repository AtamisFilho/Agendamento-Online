-- Seed: sample services (run after creating a provider user)
-- Replace 'YOUR_PROVIDER_USER_ID' with the actual UUID from auth.users

-- Sample services
insert into public.services (name, description, duration_minutes, price_cents, color) values
  ('Consulta Padrão', 'Consulta inicial de 30 minutos para avaliação geral.', 30, 15000, '#6366f1'),
  ('Consulta Retorno', 'Retorno de consulta, 20 minutos.', 20, 8000, '#8b5cf6'),
  ('Avaliação Completa', 'Avaliação completa com 1 hora de duração.', 60, 30000, '#06b6d4');
