import React, { useState, useRef, TouchEvent, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  dismissThreshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onDismiss,
  className,
  dismissThreshold = 100,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Only allow left swipe (negative values)
    if (diff < 0) {
      const resistance = 0.6;
      setTranslateX(Math.max(diff * resistance, -150));
    }
  }, [isDragging]);

  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    if (Math.abs(translateX) >= dismissThreshold) {
      triggerHaptic();
      setTranslateX(-300);
      setTimeout(() => {
        onDismiss?.();
      }, 200);
    } else {
      setTranslateX(0);
    }
  }, [translateX, dismissThreshold, onDismiss, triggerHaptic]);

  const progress = Math.min(Math.abs(translateX) / dismissThreshold, 1);

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {/* Background action indicator */}
      <div 
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-destructive transition-opacity',
          progress > 0.3 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ width: Math.abs(translateX) + 20 }}
      >
        <Trash2 
          className={cn(
            'w-5 h-5 text-destructive-foreground transition-transform',
            progress >= 1 && 'scale-110'
          )} 
        />
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        className={cn(
          'relative bg-white transition-transform',
          !isDragging && 'duration-200 ease-out'
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
