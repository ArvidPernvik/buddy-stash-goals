import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp, Users, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points?: number;
  total_saved?: number;
  goals_completed?: number;
  streak_days?: number;
  rank: number;
}

interface GroupLeaderboard {
  group_id: string;
  group_name: string;
  total_saved: number;
  member_count: number;
  rank: number;
}

export const LeaderboardPanel = () => {
  const { user } = useAuth();
  const [pointsLeaderboard, setPointsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [savingsLeaderboard, setSavingsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groupsLeaderboard, setGroupsLeaderboard] = useState<GroupLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Points leaderboard
      const { data: pointsData } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          total_points,
          streak_days,
          profiles(display_name)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      if (pointsData) {
        const processedPoints = pointsData.map((entry: any, index) => ({
          user_id: entry.user_id,
          display_name: entry.profiles?.display_name || 'Unknown user',
          total_points: entry.total_points,
          streak_days: entry.streak_days,
          rank: index + 1
        }));
        setPointsLeaderboard(processedPoints);
      }

      // Savings leaderboard - get total saved per user from contributions
      const { data: savingsData } = await supabase
        .from('goal_contributions')
        .select(`
          user_id,
          amount
        `);

      if (savingsData) {
        // Get user profiles separately to avoid relationship issues
        const userIds = [...new Set(savingsData.map(contrib => contrib.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);

        const profilesMap = profilesData?.reduce((acc: any, profile: any) => {
          acc[profile.user_id] = profile.display_name;
          return acc;
        }, {}) || {};

        const userSavings = savingsData.reduce((acc: any, contrib: any) => {
          if (!acc[contrib.user_id]) {
            acc[contrib.user_id] = {
              user_id: contrib.user_id,
              display_name: profilesMap[contrib.user_id] || 'Unknown user',
              total_saved: 0
            };
          }
          acc[contrib.user_id].total_saved += contrib.amount / 100; // Convert from cents
          return acc;
        }, {});

        const sortedSavings = Object.values(userSavings)
          .sort((a: any, b: any) => b.total_saved - a.total_saved)
          .slice(0, 10)
          .map((entry: any, index) => ({
            ...entry,
            rank: index + 1
          }));

        setSavingsLeaderboard(sortedSavings as LeaderboardEntry[]);
      }

      // Groups leaderboard - simplified to avoid complex nested queries
      const { data: groupsData } = await supabase
        .from('savings_groups')
        .select('id, name')
        .eq('is_public', true);

      if (groupsData) {
        const processedGroups = await Promise.all(
          groupsData.map(async (group: any) => {
            // Get member count
            const { count: memberCount } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            // Get total saved using our custom function
            const { data: totalSaved } = await supabase
              .rpc('get_group_total_contributions', { group_uuid: group.id });

            return {
              group_id: group.id,
              group_name: group.name,
              total_saved: (totalSaved || 0) / 100, // Convert from cents
              member_count: memberCount || 0,
              rank: 0
            };
          })
        );

        const sortedGroups = processedGroups
          .sort((a, b) => b.total_saved - a.total_saved)
          .slice(0, 10)
          .map((group, index) => ({
            ...group,
            rank: index + 1
          }));

        setGroupsLeaderboard(sortedGroups);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-text-secondary">#{rank}</span>;
  };

  const getCurrentUserRank = (leaderboard: LeaderboardEntry[]) => {
    return leaderboard.find(entry => entry.user_id === user?.id);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="h-4 bg-muted rounded flex-1"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Rankings</h2>
        <p className="text-text-secondary">See how you stack up against other savers</p>
      </div>

      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Savings
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Points Leaderboard
            </h3>
            
            {getCurrentUserRank(pointsLeaderboard) && (
              <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-sm font-bold">
                    #{getCurrentUserRank(pointsLeaderboard)!.rank}
                  </div>
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold">You</span>
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">Your position</div>
                    <div className="text-sm text-text-secondary">{getCurrentUserRank(pointsLeaderboard)!.total_points} points</div>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-3">
              {pointsLeaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.user_id === user?.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {entry.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">{entry.display_name}</div>
                    <div className="text-sm text-text-secondary">
                      {entry.streak_days} day streak
                    </div>
                  </div>
                  <Badge variant="secondary">{entry.total_points} points</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Savings Leaderboard
            </h3>
            
            <div className="space-y-3">
              {savingsLeaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.user_id === user?.id ? 'bg-success/10 border border-success/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                      <span className="text-success font-semibold text-sm">
                        {entry.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">{entry.display_name}</div>
                    <div className="text-sm text-text-secondary">Total saved</div>
                  </div>
                  <Badge variant="outline" className="text-success border-success/20">
                    ${entry.total_saved?.toLocaleString('en-US')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Group Leaderboard
            </h3>
            
            <div className="space-y-3">
              {groupsLeaderboard.map((group) => (
                <div
                  key={group.group_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(group.rank)}
                  </div>
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary">{group.group_name}</div>
                    <div className="text-sm text-text-secondary">{group.member_count} members</div>
                  </div>
                  <Badge variant="outline" className="text-blue-500 border-blue-500/20">
                    ${group.total_saved.toLocaleString('en-US')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};