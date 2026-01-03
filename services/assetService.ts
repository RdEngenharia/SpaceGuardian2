// Este serviço é responsável por carregar todas as imagens do jogo
// antes que a jogabilidade comece. Ele inclui um sistema de fallback
// para gerar imagens de placeholder caso os arquivos de imagem reais
// não sejam encontrados.

// --- INÍCIO: SISTEMA DE PLACEHOLDERS ---

const generatePlaceholder = (width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        draw(ctx, width, height);
    }
    return canvas.toDataURL();
};

const placeholderManifest: Record<string, string> = {
    playerShip1: generatePlaceholder(45, 50, (ctx, w, h) => {
        ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(0, h); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }),
    playerShip2: generatePlaceholder(45, 50, (ctx, w, h) => {
        ctx.fillStyle = '#99f'; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(0, h); ctx.lineTo(w / 4, h * 0.8); ctx.lineTo(w / 2, h * 0.9); ctx.lineTo(w * 0.75, h * 0.8); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }),
    playerShip3: generatePlaceholder(45, 50, (ctx, w, h) => {
        ctx.fillStyle = '#9f9'; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(0, h * 0.8); ctx.lineTo(w / 2, h); ctx.lineTo(w, h * 0.8); ctx.closePath(); ctx.fill();
    }),
    shield: generatePlaceholder(100, 100, (ctx, w, h) => {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.7)"; ctx.lineWidth = w/10; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - ctx.lineWidth, 0, Math.PI * 2); ctx.stroke();
    }),
    meteor: generatePlaceholder(60, 60, (ctx, w, h) => {
        ctx.fillStyle = '#85674f'; ctx.beginPath(); ctx.moveTo(w*0.5, 0); ctx.lineTo(w, h*0.3); ctx.lineTo(w*0.8, h); ctx.lineTo(w*0.2, h); ctx.lineTo(0, h*0.7); ctx.closePath(); ctx.fill();
    }),
    meteorBig: generatePlaceholder(160, 160, (ctx, w, h) => {
        ctx.fillStyle = '#a0f'; ctx.beginPath(); ctx.moveTo(w*0.5, 0); ctx.lineTo(w, h*0.3); ctx.lineTo(w*0.8, h); ctx.lineTo(w*0.2, h); ctx.lineTo(0, h*0.7); ctx.closePath(); ctx.fill();
    }),
    enemyZangano: generatePlaceholder(55, 55, (ctx, w, h) => {
        ctx.fillStyle = '#90f'; ctx.beginPath(); ctx.moveTo(w/2, h); ctx.lineTo(0, 0); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
    }),
    enemyVespa: generatePlaceholder(45, 45, (ctx, w, h) => {
        ctx.fillStyle = '#0f0'; ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    }),
    enemyBesouro: generatePlaceholder(70, 70, (ctx, w, h) => {
        ctx.fillStyle = '#f90'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2, 0, Math.PI*2); ctx.fill();
    }),
    background1: generatePlaceholder(10, 10, (ctx, w, h) => {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#000'); grad.addColorStop(1, '#020A1F'); ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    }),
    background2: generatePlaceholder(10, 10, (ctx, w, h) => {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1E002B'); grad.addColorStop(1, '#000'); ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    }),
    background3: generatePlaceholder(10, 10, (ctx, w, h) => {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#002B1D'); grad.addColorStop(1, '#000'); ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    }),
    background4: generatePlaceholder(10, 10, (ctx, w, h) => {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#2B0000'); grad.addColorStop(1, '#000'); ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    }),
};

// --- FIM: SISTEMA DE PLACEHOLDERS ---

// CORREÇÃO AQUI: Removemos a barra '/' inicial para usar caminhos relativos
const assetManifest = {
  playerShip1: 'assets/images/player_ship_1.png',
  playerShip2: 'assets/images/player_ship_2.png',
  playerShip3: 'assets/images/player_ship_3.png',
  shield: 'assets/images/shield.png',
  meteor: 'assets/images/meteor.png',
  meteorBig: 'assets/images/meteor_big.png',
  enemyZangano: 'assets/images/enemy_zangano.png',
  enemyVespa: 'assets/images/enemy_vespa.png',
  enemyBesouro: 'assets/images/enemy_besouro.png',
  background1: 'assets/images/background_1.png',
  background2: 'assets/images/background_2.png',
  background3: 'assets/images/background_3.png',
  background4: 'assets/images/background_4.png',
};

const assets: Record<string, HTMLImageElement> = {};
let loaded = false;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at path: ${src}`));
  });
};

const loadAssets = async (): Promise<void> => {
  for (const [name, src] of Object.entries(assetManifest)) {
    try {
      const image = await loadImage(src);
      assets[name] = image;
    } catch (error) {
      console.warn(`${(error as Error).message}. Using a placeholder instead.`);
      try {
        const placeholderSrc = placeholderManifest[name];
        if (placeholderSrc) {
          const placeholderImage = await loadImage(placeholderSrc);
          assets[name] = placeholderImage;
        } else {
          console.warn(`No placeholder found for asset: ${name}`);
        }
      } catch (placeholderError) {
        console.error(`Fatal: Failed to load placeholder for ${name}`, placeholderError);
      }
    }
  }

  loaded = true;
  console.log('Asset loading process finished.');
};

export const BACKGROUND_COUNT = 4;

const assetService = {
  assets,
  loadAssets,
  isLoaded: () => loaded,
};

export default assetService;