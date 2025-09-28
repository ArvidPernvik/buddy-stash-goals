-- Update RLS policies to support individual goals within groups
-- Members should be able to see each other's individual goals but only contribute to their own

-- First, let's add a policy for group members to view individual goals of other group members
CREATE POLICY "Group members can view individual goals of other members" 
ON public.savings_goals 
FOR SELECT 
USING (
  group_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 
    FROM group_members 
    WHERE group_members.group_id = savings_goals.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Update the existing policy name for clarity
DROP POLICY IF EXISTS "Group members can view group goals" ON public.savings_goals;

-- Update contributions policy to allow users to contribute only to their own goals
-- (This policy should already work correctly, but let's make sure it's clear)
CREATE POLICY "Users can contribute to their own goals only" 
ON public.goal_contributions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 
    FROM savings_goals 
    WHERE savings_goals.id = goal_contributions.goal_id 
    AND savings_goals.user_id = auth.uid()
  )
);

-- Drop the old policy since we're replacing it
DROP POLICY IF EXISTS "Users can create contributions" ON public.goal_contributions;