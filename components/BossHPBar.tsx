
import React from 'react';

interface BossHPBarProps {
  current: number;
  max: number;
}

const BossHPBar: React.FC<BossHPBarProps> = ({ current, max }) => {
  if (current <= 0) return null;
  const hpPercent = (current / max) * 100;

  return (
    <div className="fixed top-44 sm:top-24 left-1/2 -translate-x-1/2 w-52 h-3 border-2 border-white z-10 bg-gray-700">
      <div 
        className="h-full bg-red-600 transition-all duration-200"
        style={{ width: `${hpPercent}%` }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label="Boss Health"
      ></div>
    </div>
  );
};

export default BossHPBar;
