-- Fix the invite code generation function to be more robust
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    -- Generate a random 8-character code with letters and numbers
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if this code already exists
    IF NOT EXISTS (SELECT 1 FROM savings_groups WHERE invite_code = code) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique invite code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$function$;

-- Ensure the trigger is properly set up for invite code generation
DROP TRIGGER IF EXISTS set_invite_code_trigger ON public.savings_groups;

CREATE TRIGGER set_invite_code_trigger
  BEFORE INSERT ON public.savings_groups
  FOR EACH ROW
  WHEN (NEW.invite_code IS NULL OR NEW.invite_code = '')
  EXECUTE FUNCTION public.set_invite_code();

-- Fix the RLS policy for group creation - make sure users can create groups
DROP POLICY IF EXISTS "Users can create groups" ON public.savings_groups;

CREATE POLICY "Users can create groups" 
ON public.savings_groups 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);