-- Inserir user_roles com role 'operador' para os efetivos listados.
-- Todos são operador.
-- Só insere se ainda não existir registro em user_roles para o efetivo_id.

INSERT INTO public.user_roles (efetivo_id, role, ativo)
SELECT v.efetivo_id, 'operador'::public.app_role, true
FROM (VALUES
  ('8c7e8635-3d9e-49b7-b0dc-cab6babc7f20'::uuid),
  ('1affdf2f-23cd-44ef-a71b-95ddf43f582c'::uuid),
  ('6e600bf8-2935-4ace-bac6-cbf7bec6a506'::uuid),
  ('0b828ba8-6021-4d5a-9df0-1ab7c0dae975'::uuid)
) AS v(efetivo_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.efetivo_id = v.efetivo_id
);
