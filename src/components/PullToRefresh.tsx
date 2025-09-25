import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number | null>(null);
  const { hapticFeedback } = useMobileFeatures();

  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || startY.current === null) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, Math.min(maxPull, currentY - startY.current));
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
      
      // Haptic feedback when reaching threshold
      if (distance >= threshold && pullDistance < threshold) {
        hapticFeedback('light');
      }
    }
  }, [isPulling, pullDistance, hapticFeedback]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      hapticFeedback('medium');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    startY.current = null;
  }, [isPulling, pullDistance, isRefreshing, onRefresh, hapticFeedback]);

  const refreshOpacity = Math.min(1, pullDistance / threshold);
  const shouldShowRefresh = pullDistance >= threshold || isRefreshing;

  return (
    <div className="relative">
      {/* Pull indicator */}
      <div 
        className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 ${
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, threshold - pullDistance)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw 
            className={`w-5 h-5 transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : shouldShowRefresh ? 'rotate-180' : ''
            }`}
            style={{ opacity: refreshOpacity }}
          />
          <span 
            className="text-sm font-medium"
            style={{ opacity: refreshOpacity }}
          >
            {isRefreshing ? 'Refreshing...' : shouldShowRefresh ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};