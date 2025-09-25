import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Contributor } from "@/types";

interface ContributorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contributor: Contributor | null;
  goalTitle: string;
}

export function ContributorDetailsDialog({
  open,
  onOpenChange,
  contributor,
  goalTitle,
}: ContributorDetailsDialogProps) {
  if (!contributor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-center">
            Contributor Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={contributor.avatar} />
            <AvatarFallback className="text-lg bg-muted">
              {contributor.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-text-primary">
              {contributor.name}
            </h3>
            
            <Badge variant="outline" className="text-sm">
              {goalTitle}
            </Badge>
          </div>
          
          <div className="bg-surface-hover rounded-lg p-4 w-full text-center">
            <p className="text-text-secondary text-sm mb-1">Total contribution</p>
            <p className="text-2xl font-bold text-primary">
              {contributor.amount.toLocaleString('sv-SE')} kr
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}