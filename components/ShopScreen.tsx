
import React from 'react';
import { Title, MenuButton } from './common/Overlay';
import type { ShopUpgrades } from '../types';

interface ShopScreenProps {
  onBack: () => void;
  onBuy: (type: string, price: number) => void;
  coins: number;
  upgrades: ShopUpgrades;
}

const ShopItem: React.FC<{ title: string; onBuy: () => void; price: number; emoji?: string; imageSrc?: string; purchased?: boolean; disabled?: boolean }> = ({ title, onBuy, price, emoji, imageSrc, purchased = false, disabled = false }) => (
  <div className={`bg-gray-900/50 border border-cyan-400 p-2 flex flex-col justify-between items-center text-center h-32 ${(purchased || disabled) ? 'opacity-50' : ''}`}>
    {imageSrc ? <img src={imageSrc} alt={title} className="h-12 object-contain mb-1" /> : <span className="text-3xl mb-1">{emoji}</span>}
    <span className="text-xs mb-2 font-bold uppercase flex-grow flex items-center">{title}</span>
    <button 
      onClick={onBuy} 
      disabled={purchased || disabled}
      className="bg-cyan-400 text-black font-bold py-1 px-4 hover:bg-white transition-colors w-full mt-auto disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
    >
      {purchased ? "ADQUIRIDO" : `${price} 💎`}
    </button>
  </div>
);

const ShopScreen: React.FC<ShopScreenProps> = ({ onBack, onBuy, coins, upgrades }) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center text-center z-50 p-4 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      `}</style>

      <div className="flex-shrink-0 w-full">
        <Title>HANGAR</Title>
        <div className="text-yellow-400 text-2xl mb-5">MOEDAS: {coins}</div>
      </div>

      <div className="w-full max-w-4xl flex-grow overflow-y-auto mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ShopItem title="ESCUDO EXTRA" onBuy={() => onBuy('shield', 50)} price={50} emoji="🛡️" purchased={upgrades.shield} />
          <ShopItem title="TIRO RÁPIDO" onBuy={() => onBuy('speed', 100)} price={100} emoji="🚀" purchased={upgrades.fast} />
          <ShopItem title="TIRO DUPLO" onBuy={() => onBuy('double', 300)} price={300} emoji="🚀🚀" purchased={upgrades.gunMode >= 2} disabled={upgrades.gunMode !== 1} />
          <ShopItem title="TIRO TRIPLO" onBuy={() => onBuy('triple', 700)} price={700} emoji="🚀🚀🚀" purchased={upgrades.gunMode >= 3} disabled={upgrades.gunMode !== 2}/>
          <ShopItem title="NAVE ELITE" onBuy={() => onBuy('ship2', 500)} price={500} imageSrc="/assets/images/player_ship_2.png" purchased={upgrades.shipLevel >= 2} disabled={upgrades.shipLevel !== 1}/>
          <ShopItem title="NAVE MESTRE" onBuy={() => onBuy('ship3', 1200)} price={1200} imageSrc="/assets/images/player_ship_3.png" purchased={upgrades.shipLevel >= 3} disabled={upgrades.shipLevel !== 2}/>
          <ShopItem title="ANJO DA GUARDA" onBuy={() => onBuy('guardianAngel', 2500)} price={2500} emoji="👼" purchased={upgrades.guardianAngel}/>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <MenuButton onClick={onBack} className="bg-fuchsia-500">VOLTAR</MenuButton>
      </div>
    </div>
  );
};

export default ShopScreen;