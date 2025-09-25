import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { SavingsGoal } from "@/types";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddContribution: (goalId: string) => void;
}

export function SavingsGoalCard({ goal, onAddContribution }: SavingsGoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Card className="bg-gradient-to-br from-surface to-surface-hover border-border/50 shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-large)] transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-text-primary">{goal.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {goal.category}
              </Badge>
            </div>
            <p className="text-text-secondary text-sm mb-3">{goal.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <ProgressBar progress={progress} />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              {goal.currentAmount.toLocaleString('sv-SE')} kr av {goal.targetAmount.toLocaleString('sv-SE')} kr
            </span>
            <span className="text-text-tertiary font-medium">
              {progress.toFixed(1)}%
            </span>
          </div>

          {remaining > 0 && (
            <div className="text-sm text-text-secondary">
              <span className="font-medium text-warning">
                {remaining.toLocaleString('sv-SE')} kr kvar
              </span>
            </div>
          )}

          {goal.deadline && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <Calendar className="w-3 h-3" />
              <span>Deadline: {goal.deadline}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-text-tertiary" />
              <div className="flex -space-x-2">
                {goal.contributors.slice(0, 4).map((contributor) => (
                  <Avatar key={contributor.id} className="w-6 h-6 border-2 border-surface">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback className="text-xs bg-muted">
                      {contributor.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {goal.contributors.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-surface flex items-center justify-center">
                    <span className="text-xs text-text-tertiary">
                      +{goal.contributors.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={() => onAddContribution(goal.id)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              Bidra
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}