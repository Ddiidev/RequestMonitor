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
    await this.loadSettings();
    await i18n.loadLanguage();
    this.setupEventListeners();
    this.updateUI();
    i18n.updateUI();
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

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['minDuration']);
      if (result.minDuration !== undefined) {
        const seconds = Math.round(result.minDuration / 1000);
        document.getElementById('durationSlider').value = seconds;
        document.getElementById('durationValue').textContent = i18n.formatDuration(seconds);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
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

    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', async (e) => {
      await i18n.saveLanguage(e.target.value);
      i18n.updateUI();
      this.updateUI();
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
    button.textContent = i18n.t('test_sound_playing');
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

    document.getElementById('durationValue').textContent = i18n.formatDuration(seconds);
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
      statusText.textContent = i18n.t('status_active');
    } else {
      indicator.className = 'status-indicator inactive';
      statusText.textContent = i18n.t('status_inactive');
    }

    // Pending count
    document.getElementById('pendingCount').textContent = i18n.formatPendingCount(this.status.pendingCount);

    // Toggle monitoring button
    const toggleBtn = document.getElementById('toggleMonitoring');
    if (this.isTabMonitored()) {
      toggleBtn.textContent = i18n.t('stop_monitoring');
      toggleBtn.className = 'button button-secondary';
    } else {
      toggleBtn.textContent = i18n.t('start_monitoring');
      toggleBtn.className = 'button button-primary';
    }

    // Toggle enabled button
    const enabledBtn = document.getElementById('toggleEnabled');
    enabledBtn.textContent = this.status.isEnabled ? i18n.t('pause_notifications') : i18n.t('resume_notifications');

    // Stats
    document.getElementById('pendingRequests').textContent = this.status.pendingCount;
    document.getElementById('monitoredTabs').textContent = this.status.attachedTabs.length;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});