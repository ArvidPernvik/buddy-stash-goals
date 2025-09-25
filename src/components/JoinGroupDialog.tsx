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
        setError("Ingen grupp hittades med den inbjudningskoden");
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
        setError("Du är redan medlem i den här gruppen");
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
      setError("Ett fel uppstod när du försökte gå med i gruppen");
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
          <DialogTitle>Gå med i spargrupp</DialogTitle>
          <DialogDescription>
            Ange inbjudningskoden för att gå med i en befintlig spargrupp.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite_code">Inbjudningskod *</Label>
            <Input
              id="invite_code"
              placeholder="Ange 8-siffrig kod..."
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
              <li>• Inbjudningskoden består av 8 bokstäver/siffror</li>
              <li>• Fråga gruppledaren om koden</li>
              <li>• Du kan också hitta offentliga grupper på huvudsidan</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={!inviteCode.trim() || loading}>
              {loading ? "Går med..." : "Gå med"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};