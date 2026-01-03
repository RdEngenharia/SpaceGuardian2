
import React from 'react';
import Overlay, { Title, MenuButton } from './common/Overlay';

interface HelpScreenProps {
  onBack: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
  return (
    <Overlay>
      <Title>REGRAS</Title>
      <div className="space-y-4 text-lg mb-6 text-left max-w-md">
        <p>🚀 <span className="font-bold">MOVIMENTO:</span> Use as setas do teclado ou arraste na tela.</p>
        <p>🛡️ <span className="font-bold">ESCUDO:</span> Protege contra 1 impacto de meteoro.</p>
        <p>⏸️ <span className="font-bold">PAUSA:</span> Pressione 'P' ou 'ESC' para pausar o jogo.</p>
        <p>❄️ <span className="font-bold">CONGELAR:</span> Pressione 'C' ou 'Espaço' para usar um item de gelo.</p>
      </div>
      <MenuButton onClick={onBack}>SAIR</MenuButton>
    </Overlay>
  );
};

export default HelpScreen;
