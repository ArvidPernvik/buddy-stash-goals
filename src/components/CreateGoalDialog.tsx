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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGoal: (goal: {
    title: string;
    description: string;
    targetAmount: number;
    category: string;
    deadline?: string;
    groupId?: string;
    groupName?: string;
  }) => void;
}

interface UserGroup {
  id: string;
  name: string;
  role: string;
}

const categories = [
  "Travel",
  "Shopping", 
  "Events",
  "Gift",
  "Car",
  "Home",
  "Other"
];

export function CreateGoalDialog({
  open,
  onOpenChange,
  onCreateGoal,
}: CreateGoalDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchUserGroups();
    }
  }, [open, user]);

  const fetchUserGroups = async () => {
    try {
      const { data } = await supabase
        .from('savings_groups')
        .select(`
          id,
          name,
          group_members!inner(role)
        `)
        .eq('group_members.user_id', user!.id)
        .order('name');

      if (data) {
        setUserGroups(data.map(group => ({
          id: group.id,
          name: group.name,
          role: (group as any).group_members[0]?.role || 'member'
        })));
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid target amount",
        description: "Please enter a valid target amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !category) {
      toast({
        title: "Fill in all required fields",
        description: "Title and category must be filled in.",
        variant: "destructive",
      });
      return;
    }

    const selectedGroup = userGroups.find(g => g.id === selectedGroupId);

    onCreateGoal({
      title: title.trim(),
      description: description.trim(),
      targetAmount: amount,
      category,
      deadline: deadline || undefined,
      groupId: selectedGroupId || undefined,
      groupName: selectedGroup?.name,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setCategory("");
    setDeadline("");
    setSelectedGroupId("");
    onOpenChange(false);
    
    toast({
      title: "Savings goal created!",
      description: `"${title}" has been added${selectedGroup ? ` to ${selectedGroup.name}` : ''}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Create new savings goal
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Set up a new savings goal for yourself or your group.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-text-primary">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g. Trip to Croatia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface border-border text-text-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your savings goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-surface border-border text-text-primary resize-none"
              rows={3}
            />
          </div>

          {/* Group Selection */}
          <div className="space-y-2">
            <Label className="text-text-primary">
              Group (optional)
            </Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="bg-surface border-border text-text-primary">
                <SelectValue placeholder="Personal goal (no group)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center gap-2">
                    <span>Personal goal</span>
                    <Badge variant="secondary" className="text-xs">Private</Badge>
                  </div>
                </SelectItem>
                {userGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <span>{group.name}</span>
                      <Badge variant="outline" className="text-xs">{group.role}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-text-secondary">
              {selectedGroupId ? "Group members can see and contribute to this goal" : "Only you can see and contribute to this goal"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-text-primary">
                Target amount ($) *
              </Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="bg-surface border-border text-text-primary"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-text-primary">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-surface border-border text-text-primary">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-surface border-border text-text-primary"
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}