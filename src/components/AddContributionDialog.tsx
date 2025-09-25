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
        title: "Ogiltigt belopp",
        description: "Ange ett giltigt belopp större än 0.",
        variant: "destructive",
      });
      return;
    }

    onContribute(contributionAmount, message.trim() || undefined);
    setAmount("");
    setMessage("");
    onOpenChange(false);
    
    toast({
      title: "Bidrag tillagt!",
      description: `Du bidrog med ${contributionAmount.toLocaleString('sv-SE')} kr till ${goalTitle}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Bidra till {goalTitle}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Lägg till ditt bidrag till detta sparmål.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-text-primary">
              Belopp (kr)
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
              Meddelande (valfritt)
            </Label>
            <Textarea
              id="message"
              placeholder="Lägg till ett meddelande..."
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
              Avbryt
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Bidra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}