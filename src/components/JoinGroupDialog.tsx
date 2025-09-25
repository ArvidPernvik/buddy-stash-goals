import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupJoined: () => void;
}

export const JoinGroupDialog = ({ open, onOpenChange, onGroupJoined }: JoinGroupDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('savings_groups')
        .select('id, name')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (groupError) throw groupError;

      if (!group) {
        setError("No group found with that invite code");
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        setError("You are already a member of this group");
        return;
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          }
        ]);

      if (memberError) throw memberError;

      setInviteCode("");
      onGroupJoined();
      onOpenChange(false);
    } catch (error) {
      console.error('Error joining group:', error);
      setError("An error occurred while trying to join the group");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInviteCode("");
      setError("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
        <DialogTitle>Join Savings Group</DialogTitle>
        <DialogDescription>
          Enter the invite code to join an existing savings group.
        </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite_code">Invite Code *</Label>
            <Input
              id="invite_code"
              placeholder="Enter 8-digit code..."
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={8}
              required
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="text-sm text-text-secondary">
            <p className="mb-2">💡 Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Invite code consists of 8 letters/numbers</li>
              <li>• Ask the group leader for the code</li>
              <li>• You can also find public groups on the main page</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!inviteCode.trim() || loading}>
              {loading ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};