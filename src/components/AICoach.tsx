import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, TrendingUp, Calendar, Target, Sparkles } from "lucide-react";
import { SavingsGoal } from "@/types";

interface AICoachProps {
  goal: SavingsGoal;
  onUseRecommendation: (amount: number) => void;
}

export function AICoach({ goal, onUseRecommendation }: AICoachProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const analysis = useMemo(() => {
    const now = new Date();
    const deadline = goal.deadline ? new Date(goal.deadline) : null;
    const remaining = goal.targetAmount - goal.currentAmount;
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    
    // Calculate weeks until deadline
    const weeksUntilDeadline = deadline 
      ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)))
      : 52; // Default to 1 year if no deadline

    // Calculate current pace (assuming contributions spread over last 4 weeks)
    const estimatedWeeksOfContributions = Math.min(4, weeksUntilDeadline);
    const currentWeeklyPace = goal.currentAmount / estimatedWeeksOfContributions;

    // Calculate weeks to completion at current pace
    const weeksToCompletion = remaining > 0 && currentWeeklyPace > 0 
      ? Math.ceil(remaining / currentWeeklyPace) 
      : Infinity;

    // Calculate recommended weekly amount to meet deadline
    const recommendedWeeklyAmount = remaining / weeksUntilDeadline;

    // Generate motivation message based on progress
    const getMotivationMessage = () => {
      if (progress >= 90) {
        return "You're in the final stretch! Just a little more and you'll achieve your goal. Victory is within reach! 🏆";
      } else if (progress >= 75) {
        return "Amazing progress! You're three-quarters of the way there. Keep this momentum going strong! 💪";
      } else if (progress >= 50) {
        return "Fantastic! You've crossed the halfway mark. The hardest part is behind you now! 🚀";
      } else if (progress >= 25) {
        return "Great start! You're building a solid foundation. Every contribution brings you closer to your dream! ✨";
      } else if (progress > 0) {
        return "Every journey begins with a single step, and you've taken yours! Stay consistent and watch your goal become reality! 🌟";
      } else {
        return "Ready to start your journey? The best time to begin was yesterday, the second best time is now! 💫";
      }
    };

    // Determine if pace needs adjustment
    const needsFasterPace = weeksToCompletion > weeksUntilDeadline && remaining > 0;
    const onTrack = !needsFasterPace && remaining > 0;
    const completed = remaining <= 0;

    return {
      currentWeeklyPace: Math.max(0, currentWeeklyPace),
      weeksToCompletion: completed ? 0 : weeksToCompletion,
      recommendedWeeklyAmount: Math.max(0, recommendedWeeklyAmount),
      weeksUntilDeadline,
      motivationMessage: getMotivationMessage(),
      needsFasterPace,
      onTrack,
      completed,
      remaining
    };
  }, [goal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (weeks: number) => {
    const date = new Date();
    date.setDate(date.getDate() + (weeks * 7));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (analysis.completed) {
    return (
      <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
              <Target className="w-3 h-3 text-success" />
            </div>
            <h4 className="font-semibold text-success">Goal Completed! 🎉</h4>
          </div>
          <p className="text-sm text-text-secondary">
            Congratulations! You've successfully reached your savings goal. Time to celebrate your achievement!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              <Brain className="w-3 h-3 text-primary" />
            </div>
            <h4 className="font-semibold text-text-primary">AI Coach</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
        </div>

        <div className="space-y-3">
          {/* Current Pace */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-text-secondary" />
              <span className="text-xs text-text-secondary">Current pace</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {formatCurrency(analysis.currentWeeklyPace)}/vecka
            </Badge>
          </div>

          {/* Projected completion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-text-secondary" />
              <span className="text-xs text-text-secondary">Projected completion</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                analysis.needsFasterPace ? 'border-warning/50 text-warning' : 'border-success/50 text-success'
              }`}
            >
              {analysis.weeksToCompletion === Infinity ? 'Never' : formatDate(analysis.weeksToCompletion)}
            </Badge>
          </div>

          {/* Recommended weekly amount */}
          {goal.deadline && analysis.remaining > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-text-secondary" />
                    <span className="text-xs text-text-secondary">To meet deadline</span>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                    {formatCurrency(analysis.recommendedWeeklyAmount)}/vecka
                  </Badge>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onUseRecommendation(analysis.recommendedWeeklyAmount)}
                  className="w-full h-7 text-xs bg-primary/90 hover:bg-primary"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Använd förslag
                </Button>
              </div>
            </>
          )}

          {/* Expanded motivation section */}
          {isExpanded && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Motivation
                </h5>
                <p className="text-xs text-text-secondary leading-relaxed bg-surface/50 p-2 rounded-md">
                  {analysis.motivationMessage}
                </p>
                
                {analysis.needsFasterPace && (
                  <div className="text-xs text-warning bg-warning/5 p-2 rounded-md border border-warning/20">
                    💡 <strong>Tip:</strong> You'll need to increase your weekly contributions to meet your deadline.
                  </div>
                )}
                
                {analysis.onTrack && (
                  <div className="text-xs text-success bg-success/5 p-2 rounded-md border border-success/20">
                    ✅ <strong>On track:</strong> You're doing great! Keep up the current pace.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}