-- Fix duplicate "Le Kef" entry by keeping only the first one (using ctid)
DELETE FROM public.gouvernorats a
USING public.gouvernorats b
WHERE a.code = 'TN-33' 
  AND b.code = 'TN-33'
  AND a.ctid > b.ctid;

-- Add remaining delegations
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-23', 'TN-23-01', 'Bizerte Nord'),
  ('TN-23', 'TN-23-02', 'Bizerte Sud'),
  ('TN-23', 'TN-23-03', 'Jarzouna'),
  ('TN-23', 'TN-23-04', 'Mateur'),
  ('TN-23', 'TN-23-05', 'Menzel Bourguiba'),
  ('TN-23', 'TN-23-06', 'Tinja'),
  ('TN-23', 'TN-23-07', 'Ghar El Melh'),
  ('TN-23', 'TN-23-08', 'Menzel Jemil'),
  ('TN-23', 'TN-23-09', 'El Alia'),
  ('TN-23', 'TN-23-10', 'Ras Jebel'),
  ('TN-23', 'TN-23-11', 'Sejenane'),
  ('TN-23', 'TN-23-12', 'Joumine'),
  ('TN-23', 'TN-23-13', 'Ghezala'),
  ('TN-23', 'TN-23-14', 'Utique'),
  ('TN-52', 'TN-52-01', 'Monastir'),
  ('TN-52', 'TN-52-02', 'Ouerdanine'),
  ('TN-52', 'TN-52-03', 'Sahline'),
  ('TN-52', 'TN-52-04', 'Zéramdine'),
  ('TN-52', 'TN-52-05', 'Beni Hassen'),
  ('TN-52', 'TN-52-06', 'Jemmal'),
  ('TN-52', 'TN-52-07', 'Bembla'),
  ('TN-52', 'TN-52-08', 'Moknine'),
  ('TN-52', 'TN-52-09', 'Bekalta'),
  ('TN-52', 'TN-52-10', 'Teboulba'),
  ('TN-52', 'TN-52-11', 'Ksar Hellal'),
  ('TN-52', 'TN-52-12', 'Ksibet el-Mediouni'),
  ('TN-52', 'TN-52-13', 'Sayada-Lamta-Bou Hajar')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;