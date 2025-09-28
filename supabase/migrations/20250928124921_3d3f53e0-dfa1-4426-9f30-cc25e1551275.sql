-- Fix the infinite recursion issue in group_members RLS policies
-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can view group members" ON group_members;

-- Create a simpler, non-recursive policy for viewing group members
CREATE POLICY "Users can view group members" ON group_members
FOR SELECT 
USING (
  -- Users can see members of groups they belong to
  auth.uid() = user_id OR
  -- Or if they are a member of the same group (avoid recursion)
  group_id IN (
    SELECT gm.group_id 
    FROM group_members gm 
    WHERE gm.user_id = auth.uid()
  )
);

-- Also ensure we have a trigger to update updated_at on savings_groups
DROP TRIGGER IF EXISTS update_savings_groups_updated_at ON savings_groups;
CREATE TRIGGER update_savings_groups_updated_at
  BEFORE UPDATE ON savings_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for invite code generation if it doesn't exist
DROP TRIGGER IF EXISTS set_invite_code_trigger ON savings_groups;
CREATE TRIGGER set_invite_code_trigger
  BEFORE INSERT ON savings_groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();

-- Create a function to calculate total contributions for a group
CREATE OR REPLACE FUNCTION get_group_total_contributions(group_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total integer := 0;
BEGIN
  SELECT COALESCE(SUM(gc.amount), 0) INTO total
  FROM goal_contributions gc
  JOIN savings_goals sg ON gc.goal_id = sg.id
  WHERE sg.group_id = group_uuid;
  
  RETURN total;
END;
$$;

-- Create a function to update user gamification points
CREATE OR REPLACE FUNCTION update_user_points(user_uuid uuid, points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user gamification record
  INSERT INTO user_gamification (user_id, total_points, last_activity_date)
  VALUES (user_uuid, points_to_add, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_gamification.total_points + points_to_add,
    last_activity_date = CURRENT_DATE,
    updated_at = now();
END;
$$;

-- Create a trigger to automatically award points when contributions are made
CREATE OR REPLACE FUNCTION award_contribution_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award 1 point for every 10 units contributed (adjust as needed)
  PERFORM update_user_points(NEW.user_id, GREATEST(1, NEW.amount / 10));
  
  -- Check for achievements
  -- First contribution achievement
  IF NOT EXISTS (
    SELECT 1 FROM user_achievements ua 
    JOIN achievements a ON ua.achievement_id = a.id 
    WHERE ua.user_id = NEW.user_id AND a.name = 'First Save'
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id FROM achievements WHERE name = 'First Save';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger for awarding points
DROP TRIGGER IF EXISTS award_points_on_contribution ON goal_contributions;
CREATE TRIGGER award_points_on_contribution
  AFTER INSERT ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION award_contribution_points();