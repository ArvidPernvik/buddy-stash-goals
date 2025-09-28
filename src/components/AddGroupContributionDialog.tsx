import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface GroupGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface AddGroupContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  onContributionAdded: () => void;
}

export const AddGroupContributionDialog = ({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName,
  onContributionAdded 
}: AddGroupContributionDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<GroupGoal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && groupId) {
      fetchGroupGoals();
    }
  }, [open, groupId]);

  const fetchGroupGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('id, title, target_amount, current_amount')
        .eq('group_id', groupId);

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching group goals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGoalId || !amount) return;

    const contributionAmount = parseInt(amount);
    if (contributionAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Add contribution
      const { error: contributionError } = await supabase
        .from('goal_contributions')
        .insert([
          {
            goal_id: selectedGoalId,
            user_id: user.id,
            amount: contributionAmount,
            message: message.trim() || null
          }
        ]);

      if (contributionError) throw contributionError;

      // Update goal current amount
      const selectedGoal = goals.find(g => g.id === selectedGoalId);
      if (selectedGoal) {
        const { error: updateError } = await supabase
          .from('savings_goals')
          .update({ 
            current_amount: selectedGoal.current_amount + contributionAmount 
          })
          .eq('id', selectedGoalId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Contribution added!",
        description: `You contributed $${contributionAmount} to the group goal.`,
      });

      // Reset form
      setSelectedGoalId("");
      setAmount("");
      setMessage("");
      
      onContributionAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedGoalId("");
      setAmount("");
      setMessage("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Money to Group</DialogTitle>
          <DialogDescription>
            Contribute to a goal in "{groupName}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-text-secondary">No goals available in this group yet.</p>
              <p className="text-sm text-text-secondary mt-2">Create a goal first to start contributing!</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="goal">Select Goal *</Label>
                <Select value={selectedGoalId} onValueChange={setSelectedGoalId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a goal to contribute to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{goal.title}</span>
                          <span className="text-sm text-text-secondary ml-4">
                            ${goal.current_amount} / ${goal.target_amount}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a motivational message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedGoalId || !amount || loading || goals.length === 0}
            >
              {loading ? "Adding..." : "Add Contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};