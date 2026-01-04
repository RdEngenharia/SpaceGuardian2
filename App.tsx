
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import BackgroundCanvas from './components/BackgroundCanvas'; // Novo componente
import IntroScreen from './components/IntroScreen';
import StartScreen from './components/StartScreen';
import ShopScreen from './components/ShopScreen';
import HelpScreen from './components/HelpScreen';
import PauseScreen from './components/PauseScreen';
import GameOverScreen from './components/GameOverScreen';
import UI from './components/UI';
import MessagePopup from './components/MessagePopup';
import BossHPBar from './components/BossHPBar';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ShopUpgrades, GameStats } from './types';
import { GameState } from './types';
import audioService from './services/audioService';
import assetService from './services/assetService';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Intro);
  const [isLoading, setIsLoading] = useState(true);
  const [gameKey, setGameKey] = useState(0); // Chave para forçar recriação do GameCanvas
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    sessionCoins: 0,
    shield: false,
  });
  const [finalStats, setFinalStats] = useState({ score: 0, msg: '' });
  const [hasFreezeCharge, setHasFreezeCharge] = useState(false);
  const [bossState, setBossState] = useState<{ current: number; max: number } | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0); // Novo estado para o fundo
  
  const [totalCoins, setTotalCoins] = useLocalStorage('sg_coins_save', 0);
  const [shopUpgrades, setShopUpgrades] = useLocalStorage<ShopUpgrades>('sg_upgrades_save', { 
    shield: false, fast: false, shipLevel: 1, gunMode: 1, guardianAngel: false 
  });

  const [victoryMessage, setVictoryMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const preShopGameState = useRef<GameState>(GameState.Start);

  useEffect(() => {
    assetService.loadAssets().then(() => {
      setIsLoading(false);
    });
  }, []);

  const handleStartGame = () => {
    setGameKey(prevKey => prevKey + 1); // Gera uma nova chave para resetar o componente GameCanvas
    setGameStats({
      score: 0,
      level: 1,
      lives: 3,
      sessionCoins: 0,
      shield: shopUpgrades.shield,
    });
    setHasFreezeCharge(false);
    setBossState(null);
    setBackgroundIndex(0); // Reseta o fundo ao iniciar novo jogo
    setGameState(GameState.Playing);
  };

  const handleReturnToStart = () => {
    setGameStats({
      score: 0,
      level: 1,
      lives: 3,
      sessionCoins: 0,
      shield: shopUpgrades.shield,
    });
    setFinalStats({ score: 0, msg: '' });
    setHasFreezeCharge(false);
    setBossState(null);
    setVictoryMessage('');
    setGameState(GameState.Start);
  };

  const handlePause = useCallback(() => {
    if (gameState === GameState.Playing) setGameState(GameState.Paused);
    else if (gameState === GameState.Paused) setGameState(GameState.Playing);
  }, [gameState]);

  const handleGameOver = useCallback((score: number, msg: string) => {
    setFinalStats({ score, msg });
    setTotalCoins(prev => prev + gameStats.sessionCoins);
    setGameState(GameState.GameOver);
  }, [gameStats.sessionCoins, setTotalCoins]);

  const handleStatsUpdate = useCallback((newStats: Partial<GameStats>) => {
    setGameStats(prev => {
      const updatedStats = { ...prev, ...newStats };
      // Lógica para mudar o fundo a cada 3 níveis
      if (newStats.level && newStats.level !== prev.level) {
        const newIndex = Math.floor((newStats.level - 1) / 3);
        setBackgroundIndex(newIndex);
      }
      return updatedStats;
    });
  }, []);
  
  const handleVictory = useCallback((message: string) => {
    setVictoryMessage(message);
    setTimeout(() => setVictoryMessage(''), 2500);
  }, []);

  const handleAlert = useCallback((message: string) => {
    setAlertMessage(message);
    audioService.speak(message);
    setTimeout(() => setAlertMessage(''), 2500);
  }, []);

  const handleFreezeCharge = useCallback((hasCharge: boolean) => {
    setHasFreezeCharge(hasCharge);
  }, []);
  
  const handleBossUpdate = useCallback((hpState: {current: number, max: number} | null) => {
    setBossState(hpState);
  }, []);

  const handleGoToShop = () => {
    preShopGameState.current = gameState;
    setGameState(GameState.Shop);
  };
  
  const handleBackToMenu = () => {
    setGameState(preShopGameState.current);
  };
  
  const handleBuyUpgrade = (type: string, price: number) => {
    const currentTotal = totalCoins + gameStats.sessionCoins;
    if (currentTotal >= price) {
        let sessionCoinsAfterPurchase = gameStats.sessionCoins;
        let totalCoinsAfterPurchase = totalCoins;

        if (sessionCoinsAfterPurchase >= price) {
            sessionCoinsAfterPurchase -= price;
        } else {
            const remainder = price - sessionCoinsAfterPurchase;
            sessionCoinsAfterPurchase = 0;
            totalCoinsAfterPurchase -= remainder;
        }
        
        setTotalCoins(totalCoinsAfterPurchase);
        handleStatsUpdate({ sessionCoins: sessionCoinsAfterPurchase });

        setShopUpgrades(prev => {
          const newUpgrades = {...prev};
          if (type === 'shield') newUpgrades.shield = true;
          if (type === 'speed') newUpgrades.fast = true;
          if (type === 'double') newUpgrades.gunMode = 2;
          if (type === 'triple') newUpgrades.gunMode = 3;
          if (type === 'ship2') newUpgrades.shipLevel = 2;
          if (type === 'ship3') newUpgrades.shipLevel = 3;
          if (type === 'guardianAngel') newUpgrades.guardianAngel = true;
          return newUpgrades;
        });
        handleVictory("Melhoria adquirida!");
        // Retorna ao menu anterior após um breve delay para o jogador ver a mensagem
        setTimeout(handleBackToMenu, 800);
    } else {
        handleAlert("Moedas insuficientes!");
    }
  };

  const handleQuit = () => {
    window.close();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(gameState !== GameState.Playing && gameState !== GameState.Paused) return;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        handlePause();
      }
      if ((e.code === 'Space' || e.code === 'KeyC') && hasFreezeCharge) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('activateFreeze'));
        setHasFreezeCharge(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handlePause, hasFreezeCharge]);

  // Lógica para determinar se o GameCanvas deve ser renderizado e se deve estar pausado.
  const isGameSessionActive = 
    gameState === GameState.Playing || 
    gameState === GameState.Paused ||
    (gameState === GameState.Shop && (preShopGameState.current === GameState.Playing || preShopGameState.current === GameState.Paused));

  const isGameEffectivelyPaused = 
    gameState === GameState.Paused || 
    (gameState === GameState.Shop && isGameSessionActive);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <BackgroundCanvas backgroundIndex={backgroundIndex} />

      {isGameSessionActive && <GameCanvas 
        isPaused={isGameEffectivelyPaused} 
        onStatsUpdate={handleStatsUpdate}
        onGameOver={handleGameOver}
        onFreezeCharge={handleFreezeCharge}
        onVictory={handleVictory}
        onAlert={handleAlert}
        onBossUpdate={handleBossUpdate}
        shopUpgrades={shopUpgrades}
        initialShield={gameStats.shield}
        key={gameKey}
      />}

      {isGameSessionActive && <UI stats={gameStats} onPause={handlePause} />}
      {isGameSessionActive && bossState && <BossHPBar current={bossState.current} max={bossState.max} />}
      
      {isGameSessionActive && hasFreezeCharge && (
        <button 
          id="freeze-btn" 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('activateFreeze'));
            setHasFreezeCharge(false);
          }}
          className="absolute top-24 left-1/2 -translate-x-1/2 bg-cyan-500/30 border-2 border-cyan-400 text-white py-2 px-5 rounded-full cursor-pointer z-20 font-bold animate-pulse"
        >
          ❄️ CONGELAR (C)
        </button>
      )}

      {gameState === GameState.Intro && <IntroScreen onClose={() => setGameState(GameState.Start)} />}
      {gameState === GameState.Start && <StartScreen onStart={handleStartGame} onShop={handleGoToShop} onHelp={() => setGameState(GameState.Help)} onQuit={handleQuit} isLoading={isLoading} />}
      {gameState === GameState.Shop && <ShopScreen onBack={handleBackToMenu} onBuy={handleBuyUpgrade} coins={totalCoins + gameStats.sessionCoins} upgrades={shopUpgrades} />}
      {gameState === GameState.Help && <HelpScreen onBack={() => setGameState(GameState.Start)} />}
      {gameState === GameState.Paused && <PauseScreen onResume={handlePause} onShop={handleGoToShop} onExit={handleReturnToStart} />}
      {gameState === GameState.GameOver && <GameOverScreen stats={finalStats} onRestart={handleReturnToStart} />}

      {victoryMessage && <MessagePopup message={victoryMessage} />}
      {alertMessage && <MessagePopup message={alertMessage} />}
    </div>
  );
}
