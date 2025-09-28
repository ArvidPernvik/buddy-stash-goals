-- Fix infinite recursion in group_members policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

-- Create a security definer function to check if user is in a group
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

-- Create a new policy that uses the security definer function
CREATE POLICY "Users can view group members" ON public.group_members
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  public.is_group_member(auth.uid(), group_id)
);

-- Also fix savings_groups policies that might have similar issues
DROP POLICY IF EXISTS "Group members can view their groups" ON public.savings_groups;

CREATE POLICY "Group members can view their groups" ON public.savings_groups
FOR SELECT USING (
  public.is_group_member(auth.uid(), id)
);