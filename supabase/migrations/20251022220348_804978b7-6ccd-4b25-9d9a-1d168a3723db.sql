-- Insert sample delegations for Tunis
INSERT INTO public.delegations (code, nom, gouvernorat_id)
SELECT 'TU-BAB', 'Bab Bhar', g.id FROM public.gouvernorats g WHERE g.code = 'TU'
UNION ALL
SELECT 'TU-BAR', 'Bardo', g.id FROM public.gouvernorats g WHERE g.code = 'TU'
UNION ALL
SELECT 'TU-LAC', 'La Goulette', g.id FROM public.gouvernorats g WHERE g.code = 'TU'
UNION ALL
SELECT 'TU-CAR', 'Carthage', g.id FROM public.gouvernorats g WHERE g.code = 'TU'
UNION ALL
SELECT 'TU-MAR', 'La Marsa', g.id FROM public.gouvernorats g WHERE g.code = 'TU'
ON CONFLICT (code) DO NOTHING;

-- Insert sample delegations for Ariana
INSERT INTO public.delegations (code, nom, gouvernorat_id)
SELECT 'AR-ARV', 'Ariana Ville', g.id FROM public.gouvernorats g WHERE g.code = 'AR'
UNION ALL
SELECT 'AR-SOK', 'Soukra', g.id FROM public.gouvernorats g WHERE g.code = 'AR'
UNION ALL
SELECT 'AR-ROU', 'Raoued', g.id FROM public.gouvernorats g WHERE g.code = 'AR'
UNION ALL
SELECT 'AR-MNI', 'Mnihla', g.id FROM public.gouvernorats g WHERE g.code = 'AR'
ON CONFLICT (code) DO NOTHING;

-- Insert sample delegations for Sfax
INSERT INTO public.delegations (code, nom, gouvernorat_id)
SELECT 'SF-MED', 'Sfax Medina', g.id FROM public.gouvernorats g WHERE g.code = 'SF'
UNION ALL
SELECT 'SF-SUD', 'Sfax Sud', g.id FROM public.gouvernorats g WHERE g.code = 'SF'
UNION ALL
SELECT 'SF-SAK', 'Sakiet Ezzit', g.id FROM public.gouvernorats g WHERE g.code = 'SF'
ON CONFLICT (code) DO NOTHING;

-- Insert sample localites for Tunis delegations
INSERT INTO public.localites (nom, code_postal, delegation_id)
SELECT 'Centre Ville', '1000', d.id FROM public.delegations d WHERE d.code = 'TU-BAB'
UNION ALL
SELECT 'Medina', '1006', d.id FROM public.delegations d WHERE d.code = 'TU-BAB'
UNION ALL
SELECT 'Bardo', '2000', d.id FROM public.delegations d WHERE d.code = 'TU-BAR'
UNION ALL
SELECT 'La Goulette', '2060', d.id FROM public.delegations d WHERE d.code = 'TU-LAC'
UNION ALL
SELECT 'Carthage Présidence', '2016', d.id FROM public.delegations d WHERE d.code = 'TU-CAR'
UNION ALL
SELECT 'La Marsa Plage', '2078', d.id FROM public.delegations d WHERE d.code = 'TU-MAR'
UNION ALL
SELECT 'Gammarth', '2078', d.id FROM public.delegations d WHERE d.code = 'TU-MAR';

-- Insert sample localites for Ariana
INSERT INTO public.localites (nom, code_postal, delegation_id)
SELECT 'Ariana Centre', '2080', d.id FROM public.delegations d WHERE d.code = 'AR-ARV'
UNION ALL
SELECT 'Soukra', '2036', d.id FROM public.delegations d WHERE d.code = 'AR-SOK'
UNION ALL
SELECT 'Raoued', '2083', d.id FROM public.delegations d WHERE d.code = 'AR-ROU'
UNION ALL
SELECT 'Mnihla', '2094', d.id FROM public.delegations d WHERE d.code = 'AR-MNI';

-- Insert sample localites for Sfax
INSERT INTO public.localites (nom, code_postal, delegation_id)
SELECT 'Sfax Ville', '3000', d.id FROM public.delegations d WHERE d.code = 'SF-MED'
UNION ALL
SELECT 'Sfax Sud', '3021', d.id FROM public.delegations d WHERE d.code = 'SF-SUD'
UNION ALL
SELECT 'Sakiet Ezzit', '3021', d.id FROM public.delegations d WHERE d.code = 'SF-SAK';