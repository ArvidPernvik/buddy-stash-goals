-- Extend profiles table with additional social features
ALTER TABLE public.profiles 
ADD COLUMN bio text,
ADD COLUMN avatar_url text,
ADD COLUMN location text,
ADD COLUMN website text;

-- Create friends table for following system
CREATE TABLE public.friends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for friends table
CREATE POLICY "Users can view friendships involving them"
ON public.friends 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create friendships as followers"
ON public.friends 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete friendships they initiated"
ON public.friends 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX idx_friends_follower ON public.friends(follower_id);
CREATE INDEX idx_friends_following ON public.friends(follower_id, following_id);

-- Create function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid)
RETURNS TABLE (
  total_goals integer,
  completed_goals integer,
  followers_count integer,
  following_count integer,
  total_saved integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT count(*)::integer FROM savings_goals WHERE user_id = user_uuid),
    (SELECT count(*)::integer FROM savings_goals WHERE user_id = user_uuid AND current_amount >= target_amount),
    (SELECT count(*)::integer FROM friends WHERE following_id = user_uuid),
    (SELECT count(*)::integer FROM friends WHERE follower_id = user_uuid),
    (SELECT COALESCE(sum(amount), 0)::integer FROM goal_contributions WHERE user_id = user_uuid);
END;
$$;