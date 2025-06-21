// Popup Script
class PopupController {
  constructor() {
    this.currentTab = null;
    this.status = {
      isEnabled: true,
      pendingCount: 0,
      attachedTabs: []
    };
    
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    await this.loadStatus();
    this.setupEventListeners();
    this.updateUI();
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
  }

  async loadStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response) {
          this.status = response;
        }
        resolve();
      });
    });
  }

  setupEventListeners() {
    document.getElementById('toggleMonitoring').addEventListener('click', () => {
      this.toggleMonitoring();
    });

    document.getElementById('toggleEnabled').addEventListener('click', () => {
      this.toggleEnabled();
    });

    document.getElementById('testSound').addEventListener('click', () => {
      this.testSound();
    });

    const slider = document.getElementById('durationSlider');
    slider.addEventListener('input', (e) => {
      this.updateMinDuration(parseInt(e.target.value));
    });
  }

  async toggleMonitoring() {
    if (!this.currentTab) return;

    chrome.runtime.sendMessage({
      action: 'toggleTab',
      tabId: this.currentTab.id
    }, (response) => {
      setTimeout(() => {
        this.loadStatus().then(() => this.updateUI());
      }, 500);
    });
  }

  toggleEnabled() {
    chrome.runtime.sendMessage({ action: 'toggleEnabled' }, (response) => {
      if (response) {
        this.status.isEnabled = response.isEnabled;
        this.updateUI();
      }
    });
  }

  testSound() {
    chrome.runtime.sendMessage({ action: 'testSound' }, (response) => {
      
    });
    
    if (this.currentTab) {
      chrome.tabs.sendMessage(this.currentTab.id, { action: 'playSound' }).catch((error) => {
        
      });
    }
    
    const button = document.getElementById('testSound');
    const originalText = button.textContent;
    button.textContent = '🔊 Tocando...';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1000);
  }

  updateMinDuration(seconds) {
    chrome.runtime.sendMessage({ 
      action: 'setMinDuration', 
      duration: seconds * 1000 
    });

    document.getElementById('durationValue').textContent = `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }

  isTabMonitored() {
    return this.currentTab && this.status.attachedTabs.includes(this.currentTab.id);
  }

  updateUI() {
    // Status indicator
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (this.status.isEnabled) {
      indicator.className = 'status-indicator active';
      statusText.textContent = 'Monitoramento ativo';
    } else {
      indicator.className = 'status-indicator inactive';
      statusText.textContent = 'Notificações pausadas';
    }

    // Pending count
    document.getElementById('pendingCount').textContent = 
      `${this.status.pendingCount} request${this.status.pendingCount !== 1 ? 's' : ''} pendente${this.status.pendingCount !== 1 ? 's' : ''}`;

    // Toggle monitoring button
    const toggleBtn = document.getElementById('toggleMonitoring');
    if (this.isTabMonitored()) {
      toggleBtn.textContent = 'Parar Monitoramento';
      toggleBtn.className = 'button button-secondary';
    } else {
      toggleBtn.textContent = 'Iniciar Monitoramento';
      toggleBtn.className = 'button button-primary';
    }

    // Toggle enabled button
    const enabledBtn = document.getElementById('toggleEnabled');
    enabledBtn.textContent = this.status.isEnabled ? 'Pausar Notificações' : 'Reativar Notificações';

    // Stats
    document.getElementById('pendingRequests').textContent = this.status.pendingCount;
    document.getElementById('monitoredTabs').textContent = this.status.attachedTabs.length;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});