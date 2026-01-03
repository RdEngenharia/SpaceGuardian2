
import React, { useRef, useEffect, useState } from 'react';
import assetService, { BACKGROUND_COUNT } from '../services/assetService';

interface BackgroundCanvasProps {
  backgroundIndex: number;
}

const FADE_DURATION = 2000; // Duração da transição em milissegundos (2 segundos)

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ backgroundIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [nextImage, setNextImage] = useState<HTMLImageElement | null>(null);
  const fadeAnimation = useRef<{ startTime: number, id: number } | null>(null);
  
  // Efeito para inicializar a primeira imagem de fundo.
  useEffect(() => {
    if (assetService.isLoaded()) {
      const initialBgName = `background1`;
      setCurrentImage(assetService.assets[initialBgName]);
    }
  }, []);

  // Efeito para lidar com a mudança de imagem de fundo.
  useEffect(() => {
    if (!assetService.isLoaded() || !currentImage) return;

    // Calcula o nome do próximo asset, fazendo um loop se o índice for maior que o número de fundos.
    const nextBgName = `background${(backgroundIndex % BACKGROUND_COUNT) + 1}`;
    const newNextImage = assetService.assets[nextBgName];

    // Só inicia a transição se a nova imagem for diferente da atual.
    if (newNextImage && newNextImage.src !== currentImage.src) {
      setNextImage(newNextImage);
      // Cancela qualquer animação de fade anterior.
      if (fadeAnimation.current) {
        cancelAnimationFrame(fadeAnimation.current.id);
      }
      // Inicia a nova animação de fade.
      fadeAnimation.current = { startTime: performance.now(), id: requestAnimationFrame(animateFade) };
    }
  }, [backgroundIndex, currentImage]);

  const animateFade = (timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !currentImage || !nextImage || !fadeAnimation.current) return;

    const elapsedTime = timestamp - fadeAnimation.current.startTime;
    const progress = Math.min(elapsedTime / FADE_DURATION, 1);
    
    // Desenha as imagens
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    
    if (progress > 0) {
        ctx.globalAlpha = progress;
        ctx.drawImage(nextImage, 0, 0, canvas.width, canvas.height);
    }

    if (progress < 1) {
      // Continua a animação.
      fadeAnimation.current.id = requestAnimationFrame(animateFade);
    } else {
      // Fim da animação. A nova imagem se torna a atual.
      setCurrentImage(nextImage);
      setNextImage(null);
      fadeAnimation.current = null;
      ctx.globalAlpha = 1;
      ctx.drawImage(nextImage, 0, 0, canvas.width, canvas.height); // Garante o desenho final
    }
  };

  // Efeito para redimensionar o canvas e redesenhar a imagem atual.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeAndDraw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (ctx && currentImage && !fadeAnimation.current) {
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
      }
    };
    
    resizeAndDraw();
    window.addEventListener('resize', resizeAndDraw);
    return () => window.removeEventListener('resize', resizeAndDraw);
  }, [currentImage]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default BackgroundCanvas;
