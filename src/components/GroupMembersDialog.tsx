import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Users, Plus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface GroupMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  inviteCode: string;
}

export const GroupMembersDialog = ({ open, onOpenChange, groupId, groupName, inviteCode }: GroupMembersDialogProps) => {
  const { toast } = useToast();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, groupId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('group_id', groupId)
        .order('joined_at');

      if (error) throw error;
      
      // Fetch profile data separately
      if (data && data.length > 0) {
        const userIds = data.map(member => member.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);

        const membersWithProfiles = data.map(member => ({
          ...member,
          profiles: profiles?.find(p => p.user_id === member.user_id) || {
            display_name: '',
            email: ''
          }
        }));
        
        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load group members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      // Here you could implement email invitation logic
      // For now, we'll just copy the invite code and show instructions
      await navigator.clipboard.writeText(`Join my savings group "${groupName}" with code: ${inviteCode}`);
      
      toast({
        title: "Invite ready!",
        description: `Invitation text copied to clipboard. Share it with ${inviteEmail}`,
      });
      
      setInviteEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare invite",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {groupName} Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite Section */}
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">Invite Friend</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Friend's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
              />
              <Button onClick={sendInvite} size="sm">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Or share code: <strong>{inviteCode}</strong>
            </p>
          </div>

          {/* Members List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No members yet</div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10">
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                        {member.profiles?.display_name?.[0] || member.profiles?.email?.[0] || '?'}
                      </div>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.profiles?.display_name || member.profiles?.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === 'admin' && <Crown className="w-4 h-4 text-yellow-500" />}
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};