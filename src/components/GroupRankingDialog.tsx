import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RankingMember {
  user_id: string;
  total_contributions: number;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface GroupRankingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export const GroupRankingDialog = ({ open, onOpenChange, groupId, groupName }: GroupRankingDialogProps) => {
  const { toast } = useToast();
  const [rankings, setRankings] = useState<RankingMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchRankings();
    }
  }, [open, groupId]);

  const fetchRankings = async () => {
    try {
      // Get all group goals for this group
      const { data: goals } = await supabase
        .from('savings_goals')
        .select('id')
        .eq('group_id', groupId);

      if (!goals || goals.length === 0) {
        setRankings([]);
        setLoading(false);
        return;
      }

      const goalIds = goals.map(g => g.id);

      // Get contributions aggregated by user
      const { data: contributions } = await supabase
        .from('goal_contributions')
        .select(`
          user_id,
          amount
        `)
        .in('goal_id', goalIds);

      if (contributions && contributions.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(contributions.map(c => c.user_id))];
        
        // Fetch profile data separately
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);

        // Aggregate contributions by user
        const userContributions = contributions.reduce((acc, contribution) => {
          const userId = contribution.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              total_contributions: 0,
              profiles: profiles?.find(p => p.user_id === userId) || {
                display_name: '',
                email: ''
              }
            };
          }
          acc[userId].total_contributions += contribution.amount;
          return acc;
        }, {} as Record<string, RankingMember>);

        // Convert to array and sort by total contributions
        const sortedRankings = Object.values(userContributions)
          .sort((a, b) => b.total_contributions - a.total_contributions);

        setRankings(sortedRankings);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast({
        title: "Error",
        description: "Failed to load group rankings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">{index + 1}</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {groupName} Ranking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">Loading rankings...</div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No contributions yet. Be the first to save!
            </div>
          ) : (
            rankings.map((member, index) => (
              <div
                key={member.user_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' :
                  index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' :
                  index === 2 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200' :
                  'bg-background'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(index)}
                  </div>
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10">
                    <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                      {member.profiles?.display_name?.[0] || member.profiles?.email?.[0] || '?'}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.profiles?.display_name || member.profiles?.email || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rank #{index + 1}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">
                    ${member.total_contributions.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">contributed</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};