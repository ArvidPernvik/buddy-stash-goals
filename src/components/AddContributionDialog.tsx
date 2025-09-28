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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AddContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalTitle: string;
  onContribute: (amount: number, message?: string) => void;
  suggestedAmount?: number;
}

const PRESET_AMOUNTS = [25, 50, 75, 100, 200, 500];
const FREQUENCIES = [
  { label: "One time", value: "once" },
  { label: "Weekly", value: "weekly" },
  { label: "Every 2 weeks", value: "biweekly" },
  { label: "Monthly", value: "monthly" }
];

export function AddContributionDialog({
  open,
  onOpenChange,
  goalTitle,
  onContribute,
  suggestedAmount,
}: AddContributionDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState("once");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  // Set suggested amount when dialog opens
  useEffect(() => {
    if (open && suggestedAmount) {
      // Check if suggested amount matches a preset
      const presetMatch = PRESET_AMOUNTS.find(preset => Math.abs(preset - suggestedAmount) < 1);
      if (presetMatch) {
        setSelectedAmount(presetMatch);
        setIsCustom(false);
        setCustomAmount("");
      } else {
        setSelectedAmount(null);
        setIsCustom(true);
        setCustomAmount(suggestedAmount.toFixed(0));
      }
    } else if (open && !suggestedAmount) {
      setSelectedAmount(null);
      setCustomAmount("");
      setIsCustom(false);
    }
  }, [open, suggestedAmount]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomAmountSelect = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const getCurrentAmount = () => {
    if (isCustom) {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributionAmount = getCurrentAmount();
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please select or enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    onContribute(contributionAmount, message.trim() || undefined);
    
    // Reset form
    setSelectedAmount(null);
    setCustomAmount("");
    setIsCustom(false);
    setFrequency("once");
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
            Choose your contribution amount and frequency.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contribution Amount */}
          <div className="space-y-3">
            <Label className="text-text-primary font-medium">
              Contribution amount
            </Label>
            
            {/* Preset Amounts */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={`h-12 ${
                    selectedAmount === amount 
                      ? "bg-primary text-primary-foreground" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleAmountSelect(amount)}
                >
                  ${amount}
                </Button>
              ))}
              
              {/* Custom Amount Button */}
              <Button
                type="button"
                variant={isCustom ? "default" : "outline"}
                className={`h-12 col-span-3 ${
                  isCustom 
                    ? "bg-primary text-primary-foreground" 
                    : "border-border hover:border-primary/50"
                }`}
                onClick={handleCustomAmountSelect}
              >
                Custom amount
              </Button>
            </div>

            {/* Custom Amount Input */}
            {isCustom && (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-surface border-border text-text-primary"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            )}
          </div>

          {/* Payment Frequency */}
          <div className="space-y-3">
            <Label className="text-text-primary font-medium">
              Select payment frequency
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((freq) => (
                <Button
                  key={freq.value}
                  type="button"
                  variant={frequency === freq.value ? "default" : "outline"}
                  className={`h-10 ${
                    frequency === freq.value 
                      ? "bg-primary text-primary-foreground" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setFrequency(freq.value)}
                >
                  {freq.label}
                </Button>
              ))}
            </div>
            
            {frequency !== "once" && (
              <div className="text-xs text-text-secondary bg-info/5 p-2 rounded-md border border-info/20">
                <strong>Note:</strong> Recurring contributions will be set up automatically.
              </div>
            )}
          </div>
          
          {/* Message */}
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

          {/* Summary */}
          {getCurrentAmount() > 0 && (
            <div className="bg-surface/50 p-3 rounded-md border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Total contribution:</span>
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  ${getCurrentAmount().toLocaleString('en-US')}
                </Badge>
              </div>
              {frequency !== "once" && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-text-secondary">Frequency:</span>
                  <span className="text-xs text-text-primary font-medium">
                    {FREQUENCIES.find(f => f.value === frequency)?.label}
                  </span>
                </div>
              )}
            </div>
          )}
          
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
              disabled={getCurrentAmount() <= 0}
            >
              Contribute
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}