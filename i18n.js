// Sistema de internacionalização
class I18n {
  constructor() {
    this.currentLanguage = 'pt-BR';
    this.translations = {
      'pt-BR': {
        title: '🔔 Request Monitor',
        status_active: 'Monitoramento ativo',
        status_inactive: 'Notificações pausadas',
        start_monitoring: 'Iniciar Monitoramento',
        stop_monitoring: 'Parar Monitoramento',
        pause_notifications: 'Pausar Notificações',
        resume_notifications: 'Reativar Notificações',
        test_sound: '🔊 Testar Som',
        test_sound_playing: '🔊 Tocando...',
        duration_label: 'Duração mínima para notificar:',
        language_label: 'Idioma:',
        pending_requests: 'Requests pendentes:',
        monitored_tabs: 'Tabs monitoradas:',
        footer_text: 'Clique no ícone da extensão para ativar/desativar o monitoramento na aba atual',
        seconds: 'segundos',
        second: 'segundo',
        request: 'request',
        requests: 'requests',
        pending: 'pendente',
        pendings: 'pendentes'
      },
      'en': {
        title: '🔔 Request Monitor',
        status_active: 'Monitoring active',
        status_inactive: 'Notifications paused',
        start_monitoring: 'Start Monitoring',
        stop_monitoring: 'Stop Monitoring',
        pause_notifications: 'Pause Notifications',
        resume_notifications: 'Resume Notifications',
        test_sound: '🔊 Test Sound',
        test_sound_playing: '🔊 Playing...',
        duration_label: 'Minimum duration to notify:',
        language_label: 'Language:',
        pending_requests: 'Pending requests:',
        monitored_tabs: 'Monitored tabs:',
        footer_text: 'Click the extension icon to enable/disable monitoring on the current tab',
        seconds: 'seconds',
        second: 'second',
        request: 'request',
        requests: 'requests',
        pending: 'pending',
        pendings: 'pending'
      }
    };
  }

  async loadLanguage() {
    try {
      const result = await chrome.storage.sync.get(['language']);
      if (result.language) {
        this.currentLanguage = result.language;
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
    }
  }

  async saveLanguage(language) {
    try {
      this.currentLanguage = language;
      await chrome.storage.sync.set({ language: language });
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  }

  t(key) {
    return this.translations[this.currentLanguage]?.[key] || this.translations['pt-BR'][key] || key;
  }

  updateUI() {
    // Atualiza todos os elementos com data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // Atualiza o seletor de idioma
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = this.currentLanguage;
    }
  }

  formatDuration(seconds) {
    const word = seconds === 1 ? this.t('second') : this.t('seconds');
    return `${seconds} ${word}`;
  }

  formatPendingCount(count) {
    const requestWord = count === 1 ? this.t('request') : this.t('requests');
    const pendingWord = count === 1 ? this.t('pending') : this.t('pendings');
    return `${count} ${requestWord} ${pendingWord}`;
  }
}

// Instância global
const i18n = new I18n();