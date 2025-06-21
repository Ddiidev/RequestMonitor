// Content Script - Injected em todas as páginas
class SoundPlayer {
  constructor() {
    this.audioContext = null;
    this.init();
  }

  init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'playSound') {
        this.playNotificationSound();
      }
    });
    
    // Adiciona listener para inicializar o contexto de áudio com interação do usuário
    this.setupUserInteractionListener();
  }
  
  setupUserInteractionListener() {
    const initAudio = async () => {
      try {
        await this.initAudioContext();
        console.log('Contexto de áudio inicializado por interação do usuário');
        // Remove o listener após a primeira interação
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
        document.removeEventListener('touchstart', initAudio);
      } catch (error) {
        console.error('Erro ao inicializar contexto de áudio:', error);
      }
    };
    
    // Adiciona listeners para diferentes tipos de interação
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  }

  async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playNotificationSound() {
    try {
      await this.initAudioContext();
      
      // Verifica se o contexto de áudio está funcionando
      if (this.audioContext.state !== 'running') {
        console.warn('AudioContext não está rodando, tentando fallback');
        this.playSystemSound();
        return;
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
      
      console.log('Som de notificação reproduzido com sucesso');
      
    } catch (error) {
      console.error('Erro ao reproduzir som com AudioContext:', error);
      this.playSystemSound();
    }
  }

  playSystemSound() {
    try {
      console.log('Tentando reproduzir som do sistema');
      
      // Primeiro tenta com um beep simples
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAo=');
      audio.volume = 0.3;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Som do sistema reproduzido com sucesso');
        }).catch((error) => {
          console.error('Erro ao reproduzir som do sistema:', error);
          // Fallback final - tenta um beep mais simples
          this.playSimpleBeep();
        });
      }
      
    } catch (error) {
      console.error('Erro no playSystemSound:', error);
      this.playSimpleBeep();
    }
  }
  
  playSimpleBeep() {
    try {
      console.log('Tentando beep simples');
      // Cria um som muito simples
      const audio = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ4AAAC/hYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAo=');
      audio.volume = 0.1;
      audio.play().catch(() => {
        console.warn('Todos os métodos de áudio falharam');
      });
    } catch (error) {
      console.error('Erro no beep simples:', error);
    }
  }
}

const soundPlayer = new SoundPlayer();