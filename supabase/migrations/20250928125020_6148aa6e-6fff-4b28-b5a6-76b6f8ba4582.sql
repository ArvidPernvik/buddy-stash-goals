-- Fix the remaining functions with search_path
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  code := upper(substring(md5(random()::text) from 1 for 8));
  WHILE EXISTS (SELECT 1 FROM savings_groups WHERE invite_code = code) LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$;