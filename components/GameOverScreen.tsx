
import React from 'react';
import Overlay, { Title, MenuButton } from './common/Overlay';

interface GameOverScreenProps {
  stats: {
    score: number;
    msg: string;
  };
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, onRestart }) => {
  return (
    <Overlay>
      <Title className="text-red-500">FIM DE MISSÃO</Title>
      <p className="text-xl mb-2">{stats.msg}</p>
      <p className="text-lg mb-6">PONTUAÇÃO FINAL: {stats.score}</p>
      <MenuButton onClick={onRestart}>REINICIAR</MenuButton>
    </Overlay>
  );
};

export default GameOverScreen;
