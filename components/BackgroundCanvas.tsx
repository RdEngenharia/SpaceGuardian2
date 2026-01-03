
import React, { useRef, useEffect, useState, useMemo } from 'react';
import assetService, { BACKGROUND_COUNT } from '../services/assetService';

interface BackgroundCanvasProps {
  backgroundIndex: number;
}

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ backgroundIndex }) => {
  const [visibleImageIndex, setVisibleImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Memoiza a lista de imagens de fundo para evitar recálculos
  const backgroundImages = useMemo(() => {
    if (!assetService.isLoaded()) return [];
    return Array.from({ length: BACKGROUND_COUNT }, (_, i) => 
      assetService.assets[`background${i + 1}`]
    );
  }, [assetService.isLoaded()]);

  // Efeito para redimensionar o canvas e redesenhar a imagem atual
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || backgroundImages.length === 0) return;

    const resizeAndDraw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Garante que a imagem visível seja desenhada corretamente
        const imageToDraw = backgroundImages[visibleImageIndex % BACKGROUND_COUNT];
        if (imageToDraw) {
            ctx.drawImage(imageToDraw, 0, 0, canvas.width, canvas.height);
        }
      }
    };
    
    resizeAndDraw();
    window.addEventListener('resize', resizeAndDraw);
    return () => window.removeEventListener('resize', resizeAndDraw);
  }, [visibleImageIndex, backgroundImages]);

  // Efeito para gerenciar a transição de fade
  useEffect(() => {
    if (backgroundImages.length === 0) return;

    const targetIndex = backgroundIndex % BACKGROUND_COUNT;
    
    if (targetIndex !== visibleImageIndex) {
      setIsFading(true);
      
      const fadeTimeout = setTimeout(() => {
        setVisibleImageIndex(targetIndex);
        setIsFading(false);
      }, 500); // Metade da duração da transição CSS

      return () => clearTimeout(fadeTimeout);
    }
  }, [backgroundIndex, visibleImageIndex, backgroundImages]);

  if (backgroundImages.length === 0) {
    return null; // Não renderiza nada até que os assets sejam carregados
  }
  
  const prevImageIndex = visibleImageIndex;
  const nextImageIndex = backgroundIndex % BACKGROUND_COUNT;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${backgroundImages[nextImageIndex]?.src})`,
          opacity: isFading ? 1 : 0,
        }}
      />
    </div>
  );
};

export default BackgroundCanvas;