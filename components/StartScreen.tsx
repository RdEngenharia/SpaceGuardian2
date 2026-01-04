import React from 'react';
import Overlay, { Title, MenuButton } from './common/Overlay';
// IMPORTANTE: Importando o plugin nativo do Capacitor
import { App } from '@capacitor/app';

interface StartScreenProps {
  onStart: () => void;
  onShop: () => void;
  onHelp: () => void;
  onQuit: () => void;
  isLoading: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShop, onHelp, onQuit, isLoading }) => {
  
  // Função para fechar o aplicativo no Android
  const handleQuit = async () => {
    try {
      // Chama o comando nativo para encerrar o processo do app
      await App.exitApp();
    } catch (err) {
      // Caso falhe (como no navegador), ele tenta usar a função original
      console.log("Falha ao sair nativamente, tentando onQuit original", err);
      onQuit();
    }
  };

  const handleStart = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => console.log(err));
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
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
          <MenuButton onClick={onHelp}>REGRAS</MenuButton>
          {/* Alterado para chamar a nova função handleQuit */}
          <MenuButton onClick={handleQuit} className="bg-red-800">SAIR</MenuButton>
        </>
      )}
    </Overlay>
  );
};

export default StartScreen;