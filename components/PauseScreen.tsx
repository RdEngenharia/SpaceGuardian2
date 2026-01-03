
import React from 'react';
import Overlay, { Title, MenuButton } from './common/Overlay';

interface PauseScreenProps {
  onResume: () => void;
  onShop: () => void;
  onExit: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onShop, onExit }) => {
  return (
    <Overlay>
      <Title>PAUSADO</Title>
      <MenuButton onClick={onResume}>CONTINUAR</MenuButton>
      <MenuButton onClick={onShop} className="bg-yellow-400">IR PARA LOJA</MenuButton>
      <MenuButton onClick={onExit} className="bg-red-600">SAIR</MenuButton>
    </Overlay>
  );
};

export default PauseScreen;
