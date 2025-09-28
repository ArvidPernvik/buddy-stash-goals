import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Globe, Users, Target, Trophy, Calendar, UserPlus, UserMinus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  onEditProfile?: () => void;
}

export const ProfileDialog = ({ open, onOpenChange, userId, onEditProfile }: ProfileDialogProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const profileUserId = userId || user?.id;
  const isOwnProfile = user?.id === profileUserId;

  useEffect(() => {
    if (open && profileUserId) {
      fetchProfile();
      fetchStats();
      if (!isOwnProfile) {
        checkFollowStatus();
      }
    }
  }, [open, profileUserId, isOwnProfile]);

  const fetchProfile = async () => {
    if (!profileUserId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profileUserId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!profileUserId) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { user_uuid: profileUserId });

      if (error) throw error;
      setStats(data[0]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user?.id || !profileUserId || isOwnProfile) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user?.id || !profileUserId || isOwnProfile) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('friends')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileUserId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        const { error } = await supabase
          .from('friends')
          .insert([{
            follower_id: user.id,
            following_id: profileUserId
          }]);

        if (error) throw error;
        setIsFollowing(true);
        toast.success('Following successfully');
      }
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-text-secondary">Loading profile...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-text-secondary">Profile not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.display_name?.[0] || profile.email?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {profile.display_name || profile.email || 'Unknown User'}
              </h2>
              <p className="text-text-secondary text-sm">
                Member since {new Date(profile.created_at).getFullYear()}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Info */}
          <div className="space-y-4">
            {profile.bio && (
              <p className="text-text-secondary leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-3">
              {profile.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </Badge>
              )}
              {profile.website && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Website
                  </a>
                </Badge>
              )}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.total_goals}
                </div>
                <div className="text-xs text-text-secondary">Goals</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed_goals}
                </div>
                <div className="text-xs text-text-secondary">Completed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.followers_count}
                </div>
                <div className="text-xs text-text-secondary">Followers</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.following_count}
                </div>
                <div className="text-xs text-text-secondary">Following</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(stats.total_saved / 100)}
                </div>
                <div className="text-xs text-text-secondary">kr Saved</div>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button onClick={onEditProfile} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button 
                onClick={handleFollow} 
                disabled={followLoading}
                variant={isFollowing ? "outline" : "default"}
                className="flex-1"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};