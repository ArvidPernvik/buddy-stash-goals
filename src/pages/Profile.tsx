import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, MapPin, Globe, Calendar, Users, Target, Trophy, TrendingUp, Edit, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { toast } from "sonner";

interface UserProfile {
  user_id: string;
  display_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
}

interface UserStats {
  total_goals: number;
  completed_goals: number;
  followers_count: number;
  following_count: number;
  total_saved: number;
}

interface SavingsGoal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  category: string;
  deadline: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfileData();
    }
  }, [user, loading, navigate]);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id });

      if (statsError) throw statsError;

      // Fetch recent goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (goalsError) throw goalsError;

      setProfile(profileData);
      setStats(statsData[0]);
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const completionRate = stats?.total_goals ? (stats.completed_goals / stats.total_goals) * 100 : 0;
  const joinDate = new Date(profile.created_at).toLocaleDateString('sv-SE', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/30 to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-surface via-surface/80 to-primary/10 border-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {profile.display_name?.[0] || profile.email?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-success-foreground rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-1">
                  {profile.display_name || 'No display name'}
                </h1>
                <p className="text-text-secondary">{profile.email}</p>
              </div>
              
              {profile.bio && (
                <p className="text-text-secondary max-w-2xl">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats?.total_goals || 0}</p>
            <p className="text-sm text-text-secondary">Total Goals</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats?.completed_goals || 0}</p>
            <p className="text-sm text-text-secondary">Completed</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats?.followers_count || 0}</p>
            <p className="text-sm text-text-secondary">Followers</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-to-br from-info/5 to-info/10 border-info/20">
            <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-info" />
            </div>
            <p className="text-2xl font-bold text-text-primary">${((stats?.total_saved || 0) / 100).toLocaleString()}</p>
            <p className="text-sm text-text-secondary">Total Saved</p>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-surface to-surface/50">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Savings Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">Goal Completion Rate</span>
                <span className="text-sm font-medium text-text-primary">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{stats?.completed_goals || 0}</p>
                <p className="text-sm text-text-secondary">Goals Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{(stats?.total_goals || 0) - (stats?.completed_goals || 0)}</p>
                <p className="text-sm text-text-secondary">Goals in Progress</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Goals */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Recent Goals</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-primary/20 hover:bg-primary/10"
            >
              View All
            </Button>
          </div>
          
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">No goals created yet</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const isCompleted = goal.current_amount >= goal.target_amount;
                
                return (
                  <Card key={goal.id} className={`p-4 border transition-all hover:shadow-md ${
                    isCompleted ? 'border-success/30 bg-success/5' : 'border-border hover:border-primary/30'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary truncate">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-text-secondary truncate">{goal.description}</p>
                          )}
                        </div>
                        <Badge variant={isCompleted ? "default" : "secondary"} className="ml-2">
                          {goal.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">
                            ${(goal.current_amount / 100).toLocaleString()}
                          </span>
                          <span className="text-text-secondary">
                            ${(goal.target_amount / 100).toLocaleString()}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <p className="text-xs text-text-secondary text-center">
                          {progress.toFixed(1)}% completed
                        </p>
                      </div>
                      
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                          <Calendar className="w-3 h-3" />
                          <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onProfileUpdated={fetchProfileData}
      />
    </div>
  );
};

export default Profile;