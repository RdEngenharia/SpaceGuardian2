
import React, { useState, useRef, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });

  const baseSize = 144; // w-36
  const knobSize = 56;  // w-14
  const radius = baseSize / 2;
  const knobRadius = knobSize / 2;

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateKnobPosition(e.touches[0].clientX, e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging && e.touches[0]) {
      updateKnobPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  const updateKnobPosition = (clientX: number, clientY: number) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let newX = dx;
    let newY = dy;
    
    const maxDistance = radius;

    if (distance > maxDistance) {
      newX = (dx / distance) * maxDistance;
      newY = (dy / distance) * maxDistance;
    }

    setKnobPosition({ x: newX, y: newY });
    onMove(newX / maxDistance, newY / maxDistance);
  };

  return (
    <div
      ref={baseRef}
      className="fixed bottom-5 right-5 z-20 w-36 h-36 bg-gray-500/30 rounded-full flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="absolute w-14 h-14 bg-gray-400/70 rounded-full pointer-events-none"
        style={{
          transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
        }}
      />
    </div>
  );
};

export default VirtualJoystick;
