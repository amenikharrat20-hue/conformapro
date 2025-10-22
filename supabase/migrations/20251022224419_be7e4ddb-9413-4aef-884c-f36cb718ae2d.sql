-- Insert Gouvernorats of Tunisia
INSERT INTO public.gouvernorats (code, nom) VALUES
('TN-11', 'Tunis'),
('TN-12', 'Ariana'),
('TN-13', 'Ben Arous'),
('TN-14', 'Manouba'),
('TN-21', 'Nabeul'),
('TN-22', 'Zaghouan'),
('TN-23', 'Bizerte'),
('TN-31', 'Béja'),
('TN-32', 'Jendouba'),
('TN-33', 'Le Kef'),
('TN-34', 'Siliana'),
('TN-41', 'Kairouan'),
('TN-42', 'Kasserine'),
('TN-43', 'Sidi Bouzid'),
('TN-51', 'Sousse'),
('TN-52', 'Monastir'),
('TN-53', 'Mahdia'),
('TN-61', 'Sfax'),
('TN-71', 'Gafsa'),
('TN-72', 'Tozeur'),
('TN-73', 'Kebili'),
('TN-81', 'Gabès'),
('TN-82', 'Medenine'),
('TN-83', 'Tataouine')
ON CONFLICT (code) DO NOTHING;

-- Insert Delegations for Tunis
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-11', 'TN-11-01', 'Carthage'),
  ('TN-11', 'TN-11-02', 'La Médina'),
  ('TN-11', 'TN-11-03', 'Bab Bhar'),
  ('TN-11', 'TN-11-04', 'Bab Souika'),
  ('TN-11', 'TN-11-05', 'Omrane'),
  ('TN-11', 'TN-11-06', 'Omrane Supérieur'),
  ('TN-11', 'TN-11-07', 'Ettahrir'),
  ('TN-11', 'TN-11-08', 'El Menzah'),
  ('TN-11', 'TN-11-09', 'Cité El Khadra'),
  ('TN-11', 'TN-11-10', 'Bardo'),
  ('TN-11', 'TN-11-11', 'Le Kram'),
  ('TN-11', 'TN-11-12', 'La Goulette'),
  ('TN-11', 'TN-11-13', 'La Marsa'),
  ('TN-11', 'TN-11-14', 'Sidi Bou Saïd'),
  ('TN-11', 'TN-11-15', 'La Soukra'),
  ('TN-11', 'TN-11-16', 'Ezzouhour'),
  ('TN-11', 'TN-11-17', 'El Hrairia'),
  ('TN-11', 'TN-11-18', 'Sidi Hassine'),
  ('TN-11', 'TN-11-19', 'El Ouardia'),
  ('TN-11', 'TN-11-20', 'El Kabaria'),
  ('TN-11', 'TN-11-21', 'Séjoumi')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;

-- Insert Delegations for Ariana
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-12', 'TN-12-01', 'Ariana Ville'),
  ('TN-12', 'TN-12-02', 'La Soukra'),
  ('TN-12', 'TN-12-03', 'Raoued'),
  ('TN-12', 'TN-12-04', 'Kalâat el-Andalous'),
  ('TN-12', 'TN-12-05', 'Sidi Thabet'),
  ('TN-12', 'TN-12-06', 'Ettadhamen'),
  ('TN-12', 'TN-12-07', 'Mnihla')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;

-- Insert Delegations for Ben Arous
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-13', 'TN-13-01', 'Ben Arous'),
  ('TN-13', 'TN-13-02', 'El Mourouj'),
  ('TN-13', 'TN-13-03', 'Hammam Lif'),
  ('TN-13', 'TN-13-04', 'Hammam Chott'),
  ('TN-13', 'TN-13-05', 'Boumhel'),
  ('TN-13', 'TN-13-06', 'Ezzahra'),
  ('TN-13', 'TN-13-07', 'Radès'),
  ('TN-13', 'TN-13-08', 'Mégrine'),
  ('TN-13', 'TN-13-09', 'Mohamedia'),
  ('TN-13', 'TN-13-10', 'Fouchana'),
  ('TN-13', 'TN-13-11', 'Mornag'),
  ('TN-13', 'TN-13-12', 'Médina Jedida')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;

-- Insert Delegations for Manouba
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-14', 'TN-14-01', 'Manouba'),
  ('TN-14', 'TN-14-02', 'Den Den'),
  ('TN-14', 'TN-14-03', 'Douar Hicher'),
  ('TN-14', 'TN-14-04', 'Oued Ellil'),
  ('TN-14', 'TN-14-05', 'Mornaguia'),
  ('TN-14', 'TN-14-06', 'Borj El Amri'),
  ('TN-14', 'TN-14-07', 'Djedeida'),
  ('TN-14', 'TN-14-08', 'Tébourba')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;

-- Insert Delegations for Nabeul
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-21', 'TN-21-01', 'Nabeul'),
  ('TN-21', 'TN-21-02', 'Dar Chaabane'),
  ('TN-21', 'TN-21-03', 'Beni Khiar'),
  ('TN-21', 'TN-21-04', 'Korba'),
  ('TN-21', 'TN-21-05', 'Menzel Temime'),
  ('TN-21', 'TN-21-06', 'Kelibia'),
  ('TN-21', 'TN-21-07', 'Hammam Ghezèze'),
  ('TN-21', 'TN-21-08', 'Haouaria'),
  ('TN-21', 'TN-21-09', 'Takelsa'),
  ('TN-21', 'TN-21-10', 'Soliman'),
  ('TN-21', 'TN-21-11', 'Menzel Bouzelfa'),
  ('TN-21', 'TN-21-12', 'Béni Khalled'),
  ('TN-21', 'TN-21-13', 'Grombalia'),
  ('TN-21', 'TN-21-14', 'Bou Argoub'),
  ('TN-21', 'TN-21-15', 'Hammamet'),
  ('TN-21', 'TN-21-16', 'El Mida')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;

-- Insert Delegations for Sfax
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-61', 'TN-61-01', 'Sfax Ville'),
  ('TN-61', 'TN-61-02', 'Sfax Ouest'),
  ('TN-61', 'TN-61-03', 'Sfax Sud'),
  ('TN-61', 'TN-61-04', 'Sakiet Ezzit'),
  ('TN-61', 'TN-61-05', 'Sakiet Eddaier'),
  ('TN-61', 'TN-61-06', 'Chihia'),
  ('TN-61', 'TN-61-07', 'El Amra'),
  ('TN-61', 'TN-61-08', 'El Hencha'),
  ('TN-61', 'TN-61-09', 'Menzel Chaker'),
  ('TN-61', 'TN-61-10', 'Agareb'),
  ('TN-61', 'TN-61-11', 'Jebiniana'),
  ('TN-61', 'TN-61-12', 'El Ghraiba'),
  ('TN-61', 'TN-61-13', 'Bir Ali Ben Khalifa'),
  ('TN-61', 'TN-61-14', 'Skhira'),
  ('TN-61', 'TN-61-15', 'Mahres'),
  ('TN-61', 'TN-61-16', 'Kerkennah')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;

-- Insert Delegations for Sousse
INSERT INTO public.delegations (gouvernorat_id, code, nom)
SELECT g.id, d.code, d.nom
FROM (VALUES
  ('TN-51', 'TN-51-01', 'Sousse Ville'),
  ('TN-51', 'TN-51-02', 'Sousse Riadh'),
  ('TN-51', 'TN-51-03', 'Sousse Jawhara'),
  ('TN-51', 'TN-51-04', 'Sousse Sidi Abdelhamid'),
  ('TN-51', 'TN-51-05', 'Hammam Sousse'),
  ('TN-51', 'TN-51-06', 'Akouda'),
  ('TN-51', 'TN-51-07', 'Kalâa Kebira'),
  ('TN-51', 'TN-51-08', 'Sidi Bou Ali'),
  ('TN-51', 'TN-51-09', 'Hergla'),
  ('TN-51', 'TN-51-10', 'Enfidha'),
  ('TN-51', 'TN-51-11', 'Bouficha'),
  ('TN-51', 'TN-51-12', 'Kondar'),
  ('TN-51', 'TN-51-13', 'Sidi El Hani'),
  ('TN-51', 'TN-51-14', 'Msaken'),
  ('TN-51', 'TN-51-15', 'Kalâa Sghira'),
  ('TN-51', 'TN-51-16', 'Zaouia Ksiba Thrayat')
) AS d(gouv_code, code, nom)
JOIN public.gouvernorats g ON g.code = d.gouv_code
ON CONFLICT DO NOTHING;