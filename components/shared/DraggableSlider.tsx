import React, { useRef, useCallback } from 'react';

interface DraggableSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const DraggableSlider: React.FC<DraggableSliderProps> = ({ value, onChange }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const newValue = Math.round(percentage * 100);
    const clampedValue = Math.max(0, Math.min(100, newValue));
    onChange(clampedValue);
  }, [onChange]);
  
  const handleMove = useCallback((event: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    updateValue(clientX);
  }, [updateValue]);

  const handleUp = useCallback(() => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleUp);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleUp);
  }, [handleMove]);

  const handleDown = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (event.type === 'touchstart') {
      // prevent scrolling on touch devices
      event.preventDefault();
    }
      
    // React's synthetic events provide what we need.
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    updateValue(clientX);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  }, [updateValue, handleMove, handleUp]);

  return (
    <div className="w-full">
      <div
        ref={sliderRef}
        onMouseDown={handleDown}
        onTouchStart={handleDown}
        className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer select-none touch-none"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label="Progress"
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full pointer-events-none"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg ring-2 ring-white dark:ring-gray-800 pointer-events-none"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>
      <div className="text-center text-sm mt-2 text-gray-500 dark:text-gray-400">
        {value}%
      </div>
    </div>
  );
};

export default DraggableSlider;
