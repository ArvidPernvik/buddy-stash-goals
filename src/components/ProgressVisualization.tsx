import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  ChevronRight,
  CheckCircle,
  Circle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ProgressData {
  current_amount: number;
  target_amount: number;
  days_remaining?: number;
  daily_target?: number;
  weekly_progress: Array<{
    date: string;
    amount: number;
  }>;
  milestones: Array<{
    percentage: number;
    unlocked: boolean;
    unlocked_at?: string;
  }>;
}

interface ProgressVisualizationProps {
  goalId: string;
}

export const ProgressVisualization = ({ goalId }: ProgressVisualizationProps) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [goalId]);

  const fetchProgressData = async () => {
    try {
      // Fetch goal details
      const { data: goal } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (!goal) return;

      // Fetch milestones
      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('percentage');

      // Calculate weekly progress (mock data for now)
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 500) + 100
        };
      });

      // Calculate days remaining if deadline exists
      let daysRemaining;
      let dailyTarget;
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const today = new Date();
        daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const remainingAmount = goal.target_amount - goal.current_amount;
        dailyTarget = daysRemaining > 0 ? Math.ceil(remainingAmount / daysRemaining) : 0;
      }

      const processedMilestones = [25, 50, 75, 100].map(percentage => {
        const milestone = milestones?.find(m => m.percentage === percentage);
        const currentProgress = (goal.current_amount / goal.target_amount) * 100;
        return {
          percentage,
          unlocked: currentProgress >= percentage,
          unlocked_at: milestone?.unlocked_at
        };
      });

      setProgressData({
        current_amount: goal.current_amount,
        target_amount: goal.target_amount,
        days_remaining: daysRemaining,
        daily_target: dailyTarget,
        weekly_progress: weeklyProgress,
        milestones: processedMilestones
      });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progressData) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const progressPercentage = (progressData.current_amount / progressData.target_amount) * 100;
  const isCompleted = progressPercentage >= 100;

  return (
    <div className="space-y-6">
      {/* Main Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Framsteg</h3>
          <Badge variant={isCompleted ? "default" : "secondary"} className="bg-success text-success-foreground">
            {progressPercentage.toFixed(1)}%
          </Badge>
        </div>

        <div className="space-y-4">
          <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
          
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">
              {progressData.current_amount.toLocaleString('sv-SE')} kr
            </span>
            <span className="text-text-secondary">
              {progressData.target_amount.toLocaleString('sv-SE')} kr
            </span>
          </div>

          {progressData.days_remaining && progressData.daily_target && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <div className="font-semibold text-text-primary">{progressData.days_remaining}</div>
                  <div className="text-xs text-text-secondary">Dagar kvar</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Target className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="font-semibold text-text-primary">{progressData.daily_target.toLocaleString('sv-SE')} kr</div>
                  <div className="text-xs text-text-secondary">Per dag</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Weekly Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Veckans aktivitet
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {progressData.weekly_progress.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="text-xs text-text-secondary mb-1">
                {new Date(day.date).toLocaleDateString('sv-SE', { weekday: 'short' })}
              </div>
              <div 
                className="h-16 bg-primary/10 rounded flex items-end justify-center relative overflow-hidden"
              >
                <div 
                  className="bg-primary/70 w-full transition-all duration-500 ease-out"
                  style={{ height: `${(day.amount / 600) * 100}%` }}
                />
                <span className="absolute text-xs font-medium text-text-primary">
                  {day.amount > 0 ? day.amount : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Milstolpar
        </h3>
        
        <div className="space-y-3">
          {progressData.milestones.map((milestone) => (
            <div
              key={milestone.percentage}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                milestone.unlocked 
                  ? 'bg-success/10 border border-success/20' 
                  : 'bg-muted/50 border border-border/50'
              }`}
            >
              {milestone.unlocked ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
              
              <div className="flex-1">
                <div className="font-medium text-text-primary">
                  {milestone.percentage}% av målet
                </div>
                {milestone.unlocked && milestone.unlocked_at && (
                  <div className="text-sm text-success">
                    Uppnått {new Date(milestone.unlocked_at).toLocaleDateString('sv-SE')}
                  </div>
                )}
                {!milestone.unlocked && (
                  <div className="text-sm text-text-secondary">
                    {((milestone.percentage / 100) * progressData.target_amount).toLocaleString('sv-SE')} kr
                  </div>
                )}
              </div>
              
              {milestone.unlocked && (
                <Badge variant="outline" className="text-success border-success/20">
                  +{milestone.percentage === 25 ? 10 : milestone.percentage === 50 ? 25 : milestone.percentage === 75 ? 50 : 100}p
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Snabbåtgärder</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Visa statistik
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Dela framsteg
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>
      </Card>
    </div>
  );
};