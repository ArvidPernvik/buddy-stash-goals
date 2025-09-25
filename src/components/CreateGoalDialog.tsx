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
  "Resa",
  "Shopping",
  "Evenemang",
  "Gåva",
  "Bil",
  "Hem",
  "Övrigt"
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
        title: "Ogiltigt målbelopp",
        description: "Ange ett giltigt målbelopp större än 0.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !category) {
      toast({
        title: "Fyll i alla obligatoriska fält",
        description: "Titel och kategori måste fyllas i.",
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
      title: "Sparmål skapat!",
      description: `"${title}" har lagts till som ett nytt sparmål.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            Skapa nytt sparmål
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Sätt upp ett nytt sparmål för din grupp.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-text-primary">
              Titel *
            </Label>
            <Input
              id="title"
              placeholder="t.ex. Resa till Kroatien"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface border-border text-text-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">
              Beskrivning
            </Label>
            <Textarea
              id="description"
              placeholder="Beskriv ert sparmål..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-surface border-border text-text-primary resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-text-primary">
                Målbelopp (kr) *
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
                Kategori *
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-surface border-border text-text-primary">
                  <SelectValue placeholder="Välj kategori" />
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
              Deadline (valfritt)
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
              Avbryt
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Skapa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}