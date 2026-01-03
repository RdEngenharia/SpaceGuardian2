
import React from 'react';
import type { GameStats } from '../types';

interface UIProps {
  stats: GameStats;
  onPause: () => void;
}

const StatBox: React.FC<{ children: React.ReactNode, align?: 'left' | 'right' }> = ({ children, align = 'left' }) => {
  const borderClass = align === 'left' ? 'border-l-4 border-red-500 pl-3' : 'border-r-4 border-cyan-400 pr-3';
  const textAlignClass = align === 'right' ? 'text-right' : 'text-left';
  return (
    <div className={`text-shadow-lg ${borderClass} ${textAlignClass} text-sm`}>
      {children}
    </div>
  );
};

const UI: React.FC<UIProps> = ({ stats, onPause }) => {
  return (
    <div id="ui" className="fixed top-4 left-4 right-4 flex justify-between items-start font-bold uppercase z-10 pointer-events-none [text-shadow:2px_2px_#000]">
      <StatBox align="left">
        <div>VIDAS: {stats.lives} | LEVEL: {stats.level}</div>
        <div>💎 {stats.sessionCoins} | 🛡️: <span className={stats.shield ? 'text-cyan-400' : 'text-gray-500'}>{stats.shield ? "ON" : "OFF"}</span></div>
      </StatBox>
      
      <div className="flex items-start gap-4">
        <StatBox align="right">
          <div>SCORE:</div>
          <div className="text-lg">{stats.score}</div>
        </StatBox>

        <button
          onClick={onPause}
          className="bg-black/50 border-2 border-white text-white w-12 h-12 text-2xl z-20 pointer-events-auto rounded-md flex items-center justify-center active:bg-white/20"
          aria-label="Pausar Jogo"
        >
          ||
        </button>
      </div>
    </div>
  );
};

export default UI;
