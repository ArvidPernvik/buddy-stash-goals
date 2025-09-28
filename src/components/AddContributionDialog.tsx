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
import { useToast } from "@/hooks/use-toast";

interface AddContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalTitle: string;
  onContribute: (amount: number, message?: string) => void;
}

export function AddContributionDialog({
  open,
  onOpenChange,
  goalTitle,
  onContribute,
}: AddContributionDialogProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    onContribute(contributionAmount, message.trim() || undefined);
    setAmount("");
    setMessage("");
    onOpenChange(false);
    
    toast({
      title: "Contribution added!",
      description: `You contributed $${contributionAmount.toLocaleString('en-US')} to ${goalTitle}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Contribute to {goalTitle}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Add your contribution to this savings goal.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-text-primary">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-surface border-border text-text-primary resize-none"
              rows={3}
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
              Contribute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}