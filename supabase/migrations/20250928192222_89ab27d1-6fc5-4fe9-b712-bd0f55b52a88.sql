-- Make set_invite_code handle empty strings as well
CREATE OR REPLACE FUNCTION public.set_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.invite_code IS NULL OR btrim(NEW.invite_code) = '' THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- Backfill any existing groups with empty invite codes
UPDATE public.savings_groups
SET invite_code = generate_invite_code()
WHERE invite_code IS NULL OR btrim(invite_code) = '';