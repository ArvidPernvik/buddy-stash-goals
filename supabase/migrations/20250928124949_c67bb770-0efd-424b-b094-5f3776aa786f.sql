-- Fix security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION get_group_total_contributions(group_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION update_user_points(user_uuid uuid, points_to_add integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION award_contribution_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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