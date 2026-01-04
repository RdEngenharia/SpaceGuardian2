import React from 'react';
import Overlay, { Title, MenuButton } from './common/Overlay';

interface StartScreenProps {
  onStart: () => void;
  onShop: () => void;
  onHelp: () => void;
  onQuit: () => void;
  isLoading: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShop, onHelp, onQuit, isLoading }) => {
  
  // Função para requisitar tela cheia, melhorando a imersão
  const handleStart = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => console.log(err));
    } else if ((element as any).mozRequestFullScreen) { // Firefox
      (element as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) { // Chrome, Safari and Opera
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) { // IE/Edge
      (element as any).msRequestFullscreen();
    }
    onStart();
  };

  return (
    <Overlay>
      <Title>SPACE GUARDIAN</Title>
      {isLoading ? (
        <div className="text-2xl animate-pulse">CARREGANDO...</div>
      ) : (
        <>
          <MenuButton onClick={handleStart}>INICIAR DEFESA</MenuButton>
          <MenuButton onClick={onShop}>HANGAR</MenuButton>
          {/* FIX: Corrected a typo in the closing tag. */}
          <MenuButton onClick={onHelp}>REGRAS</MenuButton>
          <MenuButton onClick={onQuit} className="bg-red-800">SAIR</MenuButton>
        </>
      )}
    </Overlay>
  );
};

export default StartScreen;