-- Gamification system
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Social and community features
CREATE TABLE public.savings_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES savings_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID REFERENCES savings_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_amount INTEGER NOT NULL,
  current_amount INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  deadline DATE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.goal_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id, reaction_type)
);

CREATE TABLE public.group_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES savings_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  percentage INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Achievements are viewable by everyone
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view and update their own gamification data
CREATE POLICY "Users can view their own gamification" ON public.user_gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own gamification" ON public.user_gamification FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own gamification" ON public.user_gamification FOR UPDATE USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Public groups are viewable by everyone" ON public.savings_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Group members can view their groups" ON public.savings_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = savings_groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create groups" ON public.savings_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update groups" ON public.savings_groups FOR UPDATE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view public goals" ON public.savings_goals FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own goals" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Group members can view group goals" ON public.savings_goals FOR SELECT USING (
  group_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM group_members WHERE group_id = savings_goals.group_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create goals" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);

-- Contributions policies
CREATE POLICY "Users can view contributions for accessible goals" ON public.goal_contributions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM savings_goals sg 
    WHERE sg.id = goal_contributions.goal_id 
    AND (sg.user_id = auth.uid() OR sg.is_public = true OR 
         (sg.group_id IS NOT NULL AND EXISTS (
           SELECT 1 FROM group_members WHERE group_id = sg.group_id AND user_id = auth.uid()
         )))
  )
);
CREATE POLICY "Users can create contributions" ON public.goal_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reactions policies
CREATE POLICY "Users can view reactions on accessible content" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Group members can view chat messages" ON public.group_chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_chat_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Group members can send messages" ON public.group_chat_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM group_members WHERE group_id = group_chat_messages.group_id AND user_id = auth.uid()
  )
);

-- Milestones policies
CREATE POLICY "Users can view milestones for accessible goals" ON public.milestones FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM savings_goals sg 
    WHERE sg.id = milestones.goal_id 
    AND (sg.user_id = auth.uid() OR sg.is_public = true OR 
         (sg.group_id IS NOT NULL AND EXISTS (
           SELECT 1 FROM group_members WHERE group_id = sg.group_id AND user_id = auth.uid()
         )))
  )
);
CREATE POLICY "System can insert milestones" ON public.milestones FOR INSERT WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_groups_updated_at
  BEFORE UPDATE ON public.savings_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, points, conditions) VALUES
('First Save', 'Made your first contribution', '🎯', 10, '{"type": "first_contribution"}'),
('Streak Master', 'Save for 7 days in a row', '🔥', 50, '{"type": "streak", "days": 7}'),
('Goal Achiever', 'Complete your first savings goal', '🏆', 100, '{"type": "goal_completed", "count": 1}'),
('Social Saver', 'Join your first savings group', '👥', 25, '{"type": "group_joined", "count": 1}'),
('Milestone Maker', 'Reach 50% of any goal', '⭐', 30, '{"type": "milestone", "percentage": 50}'),
('Big Spender', 'Save 10,000 kr in total', '💰', 200, '{"type": "total_saved", "amount": 10000}'),
('Group Leader', 'Create a savings group', '👑', 75, '{"type": "group_created", "count": 1}'),
('Consistency King', 'Save for 30 days in a row', '👑', 300, '{"type": "streak", "days": 30}');

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := upper(substring(md5(random()::text) from 1 for 8));
  WHILE EXISTS (SELECT 1 FROM savings_groups WHERE invite_code = code) LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate invite codes
CREATE OR REPLACE FUNCTION set_invite_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_savings_groups_invite_code
  BEFORE INSERT ON public.savings_groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();