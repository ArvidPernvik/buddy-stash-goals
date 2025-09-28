import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGoal: (goal: {
    title: string;
    description: string;
    targetAmount: number;
    category: string;
    deadline?: string;
  }) => void;
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const { toast } = useToast();

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

    onCreateGoal({
      title: title.trim(),
      description: description.trim(),
      targetAmount: amount,
      category,
      deadline: deadline || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setCategory("");
    setDeadline("");
    onOpenChange(false);
    
    toast({
      title: "Savings goal created!",
      description: `"${title}" has been added as a new savings goal.`,
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
            Set up a new savings goal for your group.
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