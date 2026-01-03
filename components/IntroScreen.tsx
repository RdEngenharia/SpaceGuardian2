
import React from 'react';
import Overlay, { Title, MenuButton } from './common/Overlay';
import audioService from '../services/audioService';

interface IntroScreenProps {
  onClose: () => void;
}

const introText = `O ano é 2025. Uma chuva de meteoros gigantes ameaça extinguir a vida em nosso planeta. Como último Guardião Espacial, você é nossa única esperança. Destrua as ameaças, colete diamantes e não deixe nada atingir a atmosfera. Contamos com você, piloto!`;

const IntroScreen: React.FC<IntroScreenProps> = ({ onClose }) => {
  const handleReady = () => {
    audioService.init();
    audioService.speak(introText);
    onClose();
  };

  return (
    <Overlay>
      <div className="bg-black/80 p-8 border-2 border-cyan-400 max-w-2xl rounded-lg shadow-[0_0_20px_#0ff]">
        <Title>ALERTA TERRA!</Title>
        <p className="text-lg leading-relaxed text-cyan-300 mb-6 uppercase">
          {introText}
        </p>
        <MenuButton onClick={handleReady}>ESTOU PRONTO!</MenuButton>
        <div className="text-sm text-white/70 mt-4">Clique para iniciar a narração!</div>
      </div>
    </Overlay>
  );
};

export default IntroScreen;
