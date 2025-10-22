-- Add missing fields to clients table for enhanced contact and location info
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS telephone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS site_web text,
ADD COLUMN IF NOT EXISTS delegation text,
ADD COLUMN IF NOT EXISTS localite text,
ADD COLUMN IF NOT EXISTS code_postal text,
ADD COLUMN IF NOT EXISTS ville text;

-- Add unique constraint on email if it's not null
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique ON public.clients(email) WHERE email IS NOT NULL;

-- Update statut to use 'archivé' instead of 'inactif'
COMMENT ON COLUMN public.clients.statut IS 'Statut du client: actif, suspendu, archivé';