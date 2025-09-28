import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Target, DollarSign } from "lucide-react";

interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  category: string;
  deadline?: string;
}

interface PersonalGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  onGoalUpdated: () => void;
}

const categories = [
  "Travel",
  "Education",
  "Health",
  "Entertainment",
  "Technology",
  "Other"
];

export function PersonalGoalsDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  onGoalUpdated,
}: PersonalGoalsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PersonalGoal | null>(null);

  // Create goal form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Contribution form state
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionMessage, setContributionMessage] = useState("");

  useEffect(() => {
    if (open && user) {
      fetchPersonalGoals();
    }
  }, [open, user, groupId]);

  const fetchPersonalGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPersonalGoals(data || []);
    } catch (error) {
      console.error('Error fetching personal goals:', error);
      toast({
        title: "Error",
        description: "Failed to load your personal goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const targetAmount = parseFloat(goalTargetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid target amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert([
          {
            user_id: user.id,
            group_id: groupId,
            title: goalTitle,
            description: goalDescription || null,
            target_amount: Math.round(targetAmount * 100), // Convert to cents
            category: goalCategory,
            deadline: goalDeadline || null,
            current_amount: 0,
            is_public: false
          }
        ]);

      if (error) throw error;

      // Reset form
      setGoalTitle("");
      setGoalDescription("");
      setGoalTargetAmount("");
      setGoalCategory("");
      setGoalDeadline("");
      setShowCreateForm(false);

      toast({
        title: "Goal created!",
        description: `Your goal "${goalTitle}" has been created.`,
      });

      fetchPersonalGoals();
      onGoalUpdated();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGoal) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('goal_contributions')
        .insert([
          {
            goal_id: selectedGoal.id,
            user_id: user.id,
            amount: Math.round(amount * 100), // Convert to cents
            message: contributionMessage.trim() || null
          }
        ]);

      if (error) throw error;

      // Reset form
      setContributionAmount("");
      setContributionMessage("");
      setShowContributionForm(false);
      setSelectedGoal(null);

      toast({
        title: "Contribution added!",
        description: `You contributed $${amount.toLocaleString()} to ${selectedGoal.title}.`,
      });

      fetchPersonalGoals();
      onGoalUpdated();
    } catch (error) {
      console.error('Error adding contribution:', error);
      toast({
        title: "Error",
        description: "Failed to add contribution",
        variant: "destructive",
      });
    }
  };

  const handleAddContribution = (goal: PersonalGoal) => {
    setSelectedGoal(goal);
    setShowContributionForm(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setShowCreateForm(false);
      setShowContributionForm(false);
      setSelectedGoal(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-surface border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Your Goals in {groupName}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Create and manage your personal savings goals within this group.
          </DialogDescription>
        </DialogHeader>

        {showCreateForm ? (
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-text-primary">Goal Title</Label>
              <Input
                id="title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g., Trip to Japan"
                className="bg-surface border-border text-text-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-text-primary">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                placeholder="What are you saving for?"
                className="bg-surface border-border text-text-primary"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-amount" className="text-text-primary">
                  Target Amount ($)
                </Label>
                <Input
                  id="target-amount"
                  type="number"
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  placeholder="0"
                  className="bg-surface border-border text-text-primary"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-text-primary">Category</Label>
                <Select value={goalCategory} onValueChange={setGoalCategory} required>
                  <SelectTrigger className="bg-surface border-border text-text-primary">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-text-primary">
                Deadline (optional)
              </Label>
              <Input
                id="deadline"
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="bg-surface border-border text-text-primary"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Goal
              </Button>
            </div>
          </form>
        ) : showContributionForm && selectedGoal ? (
          <form onSubmit={handleContribute} className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary">{selectedGoal.title}</h3>
              <p className="text-sm text-text-secondary">
                ${(selectedGoal.current_amount / 100).toLocaleString()} / ${(selectedGoal.target_amount / 100).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-text-primary">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="0"
                className="bg-surface border-border text-text-primary"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-text-primary">
                Message (optional)
              </Label>
              <Textarea
                id="message"
                value={contributionMessage}
                onChange={(e) => setContributionMessage(e.target.value)}
                placeholder="Add a message..."
                className="bg-surface border-border text-text-primary"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowContributionForm(false);
                  setSelectedGoal(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Contribution
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">Loading your goals...</p>
              </div>
            ) : personalGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No goals yet</h3>
                <p className="text-text-secondary mb-6">
                  Create your first personal savings goal in {groupName}
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">Your Goals</h3>
                  <Button onClick={() => setShowCreateForm(true)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-4 h-4 mr-1" />
                    New Goal
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {personalGoals.map((goal) => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    const currentAmount = goal.current_amount / 100;
                    const targetAmount = goal.target_amount / 100;

                    return (
                      <Card key={goal.id} className="p-4 bg-surface border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-text-primary">{goal.title}</h4>
                            {goal.description && (
                              <p className="text-sm text-text-secondary">{goal.description}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddContribution(goal)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Progress</span>
                            <span className="font-medium text-text-primary">
                              ${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-text-secondary">{progress.toFixed(1)}% complete</span>
                            <span className="text-text-secondary">{goal.category}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}