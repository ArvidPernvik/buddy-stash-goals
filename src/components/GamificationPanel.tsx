import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Flame, Target, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at?: string;
}

interface UserStats {
  total_points: number;
  current_level: number;
  streak_days: number;
}

export const GamificationPanel = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    current_level: 1,
    streak_days: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchGamificationData();
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      // Fetch user stats
      const { data: statsData } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (statsData) {
        setUserStats({
          total_points: statsData.total_points,
          current_level: statsData.current_level,
          streak_days: statsData.streak_days
        });
      }

      // Fetch achievements with unlock status
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select(`
          *,
          user_achievements!left(unlocked_at)
        `);

      if (achievementsData) {
        const processedAchievements = achievementsData.map((achievement: any) => ({
          ...achievement,
          unlocked_at: achievement.user_achievements?.[0]?.unlocked_at
        }));
        setAchievements(processedAchievements);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPointsToNextLevel = () => {
    const pointsNeeded = userStats.current_level * 100;
    return pointsNeeded - (userStats.total_points % (userStats.current_level * 100));
  };

  const getLevelProgress = () => {
    const pointsInCurrentLevel = userStats.total_points % (userStats.current_level * 100);
    const pointsNeededForLevel = userStats.current_level * 100;
    return (pointsInCurrentLevel / pointsNeededForLevel) * 100;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
          <h3 className="text-lg font-semibold text-text-primary">Level {userStats.current_level}</h3>
          <p className="text-text-secondary">{userStats.total_points} points total</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Next level</span>
            <span className="text-text-primary font-medium">{getPointsToNextLevel()} points left</span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <div className="font-semibold text-text-primary">{userStats.streak_days}</div>
              <div className="text-xs text-text-secondary">Day streak</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <div>
              <div className="font-semibold text-text-primary">{achievements.filter(a => a.unlocked_at).length}</div>
              <div className="text-xs text-text-secondary">Achievements</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Medal className="w-5 h-5" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                achievement.unlocked_at
                  ? 'bg-success/5 border-success/20 shadow-sm'
                  : 'bg-muted/50 border-border/50 opacity-60'
              }`}
            >
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-text-primary">{achievement.name}</h4>
                  <Badge variant={achievement.unlocked_at ? "default" : "secondary"} className="text-xs">
                    {achievement.points}p
                  </Badge>
                </div>
                <p className="text-sm text-text-secondary">{achievement.description}</p>
                {achievement.unlocked_at && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-text-secondary">
                      Unlocked {new Date(achievement.unlocked_at).toLocaleDateString('en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};