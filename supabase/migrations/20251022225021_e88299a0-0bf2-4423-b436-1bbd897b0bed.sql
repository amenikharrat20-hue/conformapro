-- Change gouvernorat and delegation from enum to text for flexibility
ALTER TABLE public.sites 
  ALTER COLUMN gouvernorat TYPE text,
  ALTER COLUMN delegation TYPE text;

-- Update sites table to make localite and ville nullable (they are optional now)
ALTER TABLE public.sites 
  ALTER COLUMN localite DROP NOT NULL,
  ALTER COLUMN ville DROP NOT NULL;