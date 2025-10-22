-- Change secteur column from enum to text for flexibility
ALTER TABLE public.clients 
ALTER COLUMN secteur TYPE text;

-- Drop the now-unused secteur enum type
DROP TYPE IF EXISTS public.secteur CASCADE;