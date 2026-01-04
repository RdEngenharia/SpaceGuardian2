// ... (mantenha os imports iguais)

const GameCanvas: React.FC<GameCanvasProps> = ({ /* ... props */ }) => {
  // ... (mantenha os refs iniciais iguais)

  // Ajuste na sensibilidade do Joystick para Android
  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    // Aplicamos uma pequena "deadzone" (0.1) para evitar que a nave ande sozinha
    // e um multiplicador (1.2) para a resposta ser mais ágil no touch
    const sensitivity = 1.2;
    joystickRef.current = { 
      dx: Math.abs(dx) < 0.1 ? 0 : dx * sensitivity, 
      dy: Math.abs(dy) < 0.1 ? 0 : dy * sensitivity 
    };
  }, []);

  // --- Dentro do gameLoop, onde está a movimentação: ---
  // (Procure a parte do // --- PLAYER MOVEMENT LOGIC ---)
  
  /* DICA: No seu código original, se o usuário usar o teclado E o joystick ao mesmo tempo, 
     as velocidades se somam. O código abaixo está correto para priorizar fluidez.
  */
  if (keysRef.current['ArrowLeft']) player.x -= player.speed;
  if (keysRef.current['ArrowRight']) player.x += player.speed;
  if (keysRef.current['ArrowUp']) player.y -= player.speed;
  if (keysRef.current['ArrowDown']) player.y += player.speed;

  // Movimentação via Joystick (já com a sensibilidade aplicada)
  player.x += joystickRef.current.dx * player.speed;
  player.y += joystickRef.current.dy * player.speed;

  // ... (mantenha o restante da lógica de tiro e inimigos igual)

  return (
    <>
      {/* Canvas principal do jogo */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 block z-10" 
      />
      
      {/* Renderiza o Joystick apenas se for touch. 
          Envolvi em uma div com z-50 para garantir que nada cubra o controle.
      */}
      {isTouchDevice && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="pointer-events-auto">
            <VirtualJoystick onMove={handleJoystickMove} />
          </div>
        </div>
      )}
    </>
  );
};

export default GameCanvas;