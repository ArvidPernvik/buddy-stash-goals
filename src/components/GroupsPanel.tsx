import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Users, MessageCircle, Trophy, Share2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { JoinGroupDialog } from "./JoinGroupDialog";

interface SavingsGroup {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  invite_code: string;
  is_public: boolean;
  created_at: string;
  member_count?: number;
  total_saved?: number;
  role?: string;
}

export const GroupsPanel = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<SavingsGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<SavingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      // Fetch user's groups
      const { data: userGroups } = await supabase
        .from('savings_groups')
        .select(`
          *,
          group_members!inner(role),
          goal_contributions:savings_goals(amount)
        `)
        .eq('group_members.user_id', user!.id);

      // Fetch public groups (excluding user's groups)
      const { data: availableGroups } = await supabase
        .from('savings_groups')
        .select(`
          *,
          group_members(count)
        `)
        .eq('is_public', true)
        .not('id', 'in', `(${userGroups?.map(g => g.id).join(',') || 'null'})`);

      if (userGroups) {
        const processedUserGroups = userGroups.map((group: any) => ({
          ...group,
          role: group.group_members[0]?.role,
          total_saved: group.goal_contributions?.reduce((sum: number, contrib: any) => sum + contrib.amount, 0) || 0
        }));
        setGroups(processedUserGroups);
      }

      if (availableGroups) {
        const processedAvailableGroups = availableGroups.map((group: any) => ({
          ...group,
          member_count: group.group_members?.[0]?.count || 0
        }));
        setPublicGroups(processedAvailableGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await supabase
        .from('group_members')
        .insert([
          {
            group_id: groupId,
            user_id: user!.id,
            role: 'member'
          }
        ]);
      
      fetchGroups(); // Refresh groups
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const copyInviteCode = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      // Could add a toast notification here
    } catch (error) {
      console.error('Error copying invite code:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        <h2 className="text-2xl font-bold text-text-primary">Savings Groups</h2>
        <p className="text-text-secondary">Save together with friends and family</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowJoinDialog(true)} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Join Group
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* User's Groups */}
      {groups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">My Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10">
                      {group.avatar_url ? (
                        <img src={group.avatar_url} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-text-primary">{group.name}</h4>
                        {group.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <p className="text-sm text-text-secondary">{group.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{group.role}</Badge>
                </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Total saved</span>
                      <span className="font-semibold text-success">${group.total_saved?.toLocaleString()} </span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Trophy className="w-4 h-4 mr-2" />
                        Ranking
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyInviteCode(group.invite_code)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Public Groups */}
      {publicGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Offentliga grupper</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicGroups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10">
                      {group.avatar_url ? (
                        <img src={group.avatar_url} alt={group.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-secondary" />
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-text-primary">{group.name}</h4>
                      <p className="text-sm text-text-secondary">{group.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Offentlig</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Medlemmar</span>
                    <span className="font-semibold text-text-primary">{group.member_count}</span>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Gå med i grupp
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 && publicGroups.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Inga grupper än</h3>
          <p className="text-text-secondary mb-6">
            Skapa din första spargrupp eller gå med i en befintlig för att börja spara tillsammans
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Skapa grupp
            </Button>
            <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
              Gå med i grupp
            </Button>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <CreateGroupDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onGroupCreated={fetchGroups}
      />
      <JoinGroupDialog 
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onGroupJoined={fetchGroups}
      />
    </div>
  );
};