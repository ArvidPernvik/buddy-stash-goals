interface ProgressBarProps {
  progress: number;
  height?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  progress, 
  height = "h-2", 
  showPercentage = false 
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className={`w-full bg-progress-bg rounded-full overflow-hidden ${height}`}>
        <div 
          className="h-full bg-progress-fill transition-all duration-500 ease-out rounded-full"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-text-tertiary mt-1 text-right">
          {clampedProgress.toFixed(1)}%
        </div>
      )}
    </div>
  );
}