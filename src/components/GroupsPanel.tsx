import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Users, MessageCircle, Trophy, Share2, Crown, DollarSign, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { JoinGroupDialog } from "./JoinGroupDialog";
import { AddGroupContributionDialog } from "./AddGroupContributionDialog";

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
  const { toast } = useToast();
  const [groups, setGroups] = useState<SavingsGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<SavingsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showContributionDialog, setShowContributionDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SavingsGroup | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      // Fetch user's groups with member role
      const { data: userGroups } = await supabase
        .from('savings_groups')
        .select(`
          *,
          group_members!inner(role)
        `)
        .eq('group_members.user_id', user!.id);

      // Fetch public groups (excluding user's groups)
      const userGroupIds = userGroups?.map(g => g.id) || [];
      const { data: availableGroups } = await supabase
        .from('savings_groups')
        .select(`
          *,
          group_members(count)
        `)
        .eq('is_public', true)
        .not('id', 'in', `(${userGroupIds.length > 0 ? userGroupIds.join(',') : 'null'})`);

      if (userGroups) {
        // Calculate total saved for each group using our custom function
        const processedUserGroups = await Promise.all(userGroups.map(async (group: any) => {
          const { data: totalSaved } = await supabase
            .rpc('get_group_total_contributions', { group_uuid: group.id });
          
          return {
            ...group,
            role: group.group_members[0]?.role,
            total_saved: totalSaved || 0
          };
        }));
        setGroups(processedUserGroups);
      }

      if (availableGroups) {
        // Count members for public groups
        const processedAvailableGroups = await Promise.all(availableGroups.map(async (group: any) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
            
          return {
            ...group,
            member_count: count || 0
          };
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
      toast({
        title: "Invite code copied!",
        description: `Code ${inviteCode} copied to clipboard. Share it with your friends!`,
      });
    } catch (error) {
      console.error('Error copying invite code:', error);
      toast({
        title: "Error",
        description: "Failed to copy invite code",
        variant: "destructive",
      });
    }
  };

  const handleAddContribution = (group: SavingsGroup) => {
    setSelectedGroup(group);
    setShowContributionDialog(true);
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

                    {/* Invite Code Display */}
                    <div className="bg-muted/50 rounded-lg p-3 border border-dashed">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-secondary font-medium">Invite Code</p>
                          <p className="text-lg font-mono font-bold text-primary">{group.invite_code}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyInviteCode(group.invite_code)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">Share this code with friends!</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddContribution(group)}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Add Money
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trophy className="w-4 h-4 mr-1" />
                        Ranking
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="w-4 h-4 mr-1" />
                        Members
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
          <h3 className="text-lg font-semibold text-text-primary mb-4">Public groups</h3>
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
                  <Badge variant="outline">Public</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Members</span>
                    <span className="font-semibold text-text-primary">{group.member_count}</span>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Join group
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
          <h3 className="text-lg font-semibold text-text-primary mb-2">No groups yet</h3>
          <p className="text-text-secondary mb-6">
            Create your first savings group or join an existing one to start saving together
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create group
            </Button>
            <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
              Join group
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
      {selectedGroup && (
        <AddGroupContributionDialog
          open={showContributionDialog}
          onOpenChange={setShowContributionDialog}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onContributionAdded={fetchGroups}
        />
      )}
    </div>
  );
};