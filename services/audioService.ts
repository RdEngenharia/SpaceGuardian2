
let audioCtx: AudioContext | null = null;
let isMuted = false;
let voices: SpeechSynthesisVoice[] = [];

// --- MUDANÇA INICIADA ---
// Função para carregar as vozes disponíveis no navegador/sistema.
// A lista de vozes pode não estar disponível imediatamente, por isso
// precisamos de uma função para carregá-la e ouvi-la quando mudar.
const loadVoices = () => {
  voices = window.speechSynthesis.getVoices();
};
// --- MUDANÇA FINALIZADA ---

const initAudio = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  // --- MUDANÇA INICIADA ---
  // Garante que as vozes sejam carregadas quando o áudio for inicializado.
  if ('speechSynthesis' in window) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
      }
  }
  // --- MUDANÇA FINALIZADA ---
};

const playSound = (freq: number, duration: number, type: OscillatorType = 'triangle') => {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + duration);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    // --- MUDANÇA INICIADA ---
    // A velocidade da narração foi aumentada para 2, conforme solicitado.
    utterance.rate = 2;

    // Lógica para tentar selecionar uma voz feminina em Português do Brasil.
    // A disponibilidade de vozes depende do sistema operacional e do navegador do usuário.
    // O código prioriza vozes que se identificam como femininas.
    const femaleVoice = voices.find(
      voice => voice.lang === 'pt-BR' && (voice.name.includes('Feminino') || voice.name.includes('Female') || voice.name.includes('Maria') || voice.name.includes('Luciana'))
    );

    // Se nenhuma voz feminina for encontrada, ele seleciona a primeira voz em PT-BR disponível.
    const portugueseVoice = voices.find(voice => voice.lang === 'pt-BR');

    // Define a voz da narração.
    utterance.voice = femaleVoice || portugueseVoice || null;
    // --- MUDANÇA FINALIZADA ---

    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Speech Synthesis not supported in this browser.");
  }
};

const audioService = {
  init: initAudio,
  play: playSound,
  toggleMute: () => { isMuted = !isMuted; },
  speak: speak,
};

export default audioService;
