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
      
    } catch (error) {
      this.playSystemSound();
    }
  }

  playSystemSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAoUXrTp66hVFApGn+DyvmAcBSyG1O/BeioGKoTO9dqJOQcbZ77vqJhUEQNMo+L0sGQdBzaV3vC9eCwEIXG+8t2QQAo=');
      audio.volume = 0.3;
      audio.play().catch(() => {
        
      });
    } catch (error) {
      
    }
  }
}

const soundPlayer = new SoundPlayer();