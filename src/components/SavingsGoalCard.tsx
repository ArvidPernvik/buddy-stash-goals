import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { AICoach } from "./AICoach";
import { SavingsGoal } from "@/types";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddContribution: (goalId: string, suggestedAmount?: number) => void;
}

export function SavingsGoalCard({ goal, onAddContribution }: SavingsGoalCardProps) {
  const [showContributors, setShowContributors] = useState(false);
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const handleUseRecommendation = (amount: number) => {
    onAddContribution(goal.id, amount);
  };

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
              ${goal.currentAmount.toLocaleString('en-US')} of ${goal.targetAmount.toLocaleString('en-US')}
            </span>
            <span className="text-text-tertiary font-medium">
              {progress.toFixed(1)}%
            </span>
          </div>

          {remaining > 0 && (
            <div className="text-sm text-text-secondary">
              <span className="font-medium text-warning">
                ${remaining.toLocaleString('en-US')} remaining
              </span>
            </div>
          )}

          {goal.deadline && (
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <Calendar className="w-3 h-3" />
              <span>Deadline: {goal.deadline}</span>
            </div>
          )}

          {/* AI Coach */}
          <AICoach goal={goal} onUseRecommendation={handleUseRecommendation} />

          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowContributors(!showContributors)}
              className="flex items-center gap-2 hover:bg-surface-hover rounded-md px-2 py-1 transition-colors"
            >
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
              {showContributors ? (
                <ChevronUp className="w-4 h-4 text-text-tertiary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-tertiary" />
              )}
            </button>

            <Button 
              onClick={() => onAddContribution(goal.id)}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              Contribute
            </Button>
          </div>

          {showContributors && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <h4 className="text-sm font-medium text-text-primary mb-3">Contributors</h4>
              <div className="space-y-2">
                {goal.contributors.map((contributor) => (
                  <div key={contributor.id} className="flex items-center justify-between p-2 bg-surface-hover rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={contributor.avatar} />
                        <AvatarFallback className="text-xs bg-muted">
                          {contributor.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-text-primary">
                        {contributor.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      ${contributor.amount.toLocaleString('en-US')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}