// Service Worker da extensão
class RequestMonitor {
  constructor() {
    this.pendingRequests = new Map();
    this.attachedTabs = new Set();
    this.isEnabled = true;
    this.minDuration = 3000;
    
    this.init();
  }

  init() {
    chrome.action.onClicked.addListener((tab) => {
      this.toggleMonitoring(tab.id);
    });

    chrome.debugger.onDetach.addListener((source, reason) => {
      this.attachedTabs.delete(source.tabId);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.detachFromTab(tabId);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
    });
  }

  async toggleMonitoring(tabId) {
    if (this.attachedTabs.has(tabId)) {
      await this.detachFromTab(tabId);
    } else {
      await this.attachToTab(tabId);
    }
  }

  async attachToTab(tabId) {
    try {
      await chrome.debugger.attach({ tabId }, "1.3");
      
      await chrome.debugger.sendCommand({ tabId }, "Network.enable");
      
      // Adiciona listeners para eventos de network
      chrome.debugger.onEvent.addListener((source, method, params) => {
        if (source.tabId === tabId) {
          this.handleNetworkEvent(tabId, method, params);
        }
      });

      this.attachedTabs.add(tabId);
      
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          "16": "icon16-active.png",
          "48": "icon48-active.png",
          "128": "icon128-active.png"
        }
      });
      
    } catch (error) {
      
    }
  }

  async detachFromTab(tabId) {
    try {
      if (this.attachedTabs.has(tabId)) {
        await chrome.debugger.detach({ tabId });
        this.attachedTabs.delete(tabId);
        
        for (let [key, request] of this.pendingRequests) {
          if (request.tabId === tabId) {
            this.pendingRequests.delete(key);
          }
        }

        chrome.action.setIcon({
          tabId: tabId,
          path: {
            "16": "icon16.png",
            "48": "icon48.png",
            "128": "icon128.png"
          }
        });
      }
    } catch (error) {
      
    }
  }

  handleNetworkEvent(tabId, method, params) {
    if (!this.isEnabled) return;

    switch (method) {
      case 'Network.requestWillBeSent':
        this.onRequestStart(tabId, params);
        break;
      case 'Network.responseReceived':
        this.onRequestComplete(tabId, params);
        break;
      case 'Network.loadingFailed':
        this.onRequestComplete(tabId, params);
        break;
    }
  }

  onRequestStart(tabId, params) {
    const requestId = params.requestId;
    const url = params.request.url;
    const method = params.request.method;
    
    if (this.isStaticResource(url)) return;

    this.pendingRequests.set(requestId, {
      tabId,
      url,
      method,
      startTime: Date.now(),
      requestId
    });
  }

  onRequestComplete(tabId, params) {
    const requestId = params.requestId;
    const request = this.pendingRequests.get(requestId);
    
    if (!request) return;

    const duration = Date.now() - request.startTime;
    
    this.pendingRequests.delete(requestId);

    if (duration >= this.minDuration) {
      this.notifyRequestComplete(request, duration);
    }
  }

  notifyRequestComplete(request, duration) {
    this.playNotificationSound();

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Request Completo!',
      message: `${request.method} ${this.getShortUrl(request.url)}\nDuração: ${(duration / 1000).toFixed(1)}s`
    });
  }

  playNotificationSound() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (this.attachedTabs.has(tab.id)) {
          chrome.tabs.sendMessage(tab.id, { action: 'playSound' }).catch(() => {
            
          });
        }
      });
    });
  }

  isStaticResource(url) {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  getShortUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.length > 30 ? 
        urlObj.pathname.substring(0, 30) + '...' : 
        urlObj.pathname;
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getStatus':
        sendResponse({
          isEnabled: this.isEnabled,
          pendingCount: this.pendingRequests.size,
          attachedTabs: Array.from(this.attachedTabs)
        });
        break;
      case 'toggleEnabled':
        this.isEnabled = !this.isEnabled;
        sendResponse({ isEnabled: this.isEnabled });
        break;
      case 'toggleTab':
        this.toggleMonitoring(request.tabId);
        sendResponse({ success: true });
        break;
      case 'setMinDuration':
        this.minDuration = request.duration;
        sendResponse({ minDuration: this.minDuration });
        break;
      case 'testSound':
        this.playNotificationSound();
        sendResponse({ success: true });
        break;
    }
    return true;
  }
}

// Inicializa o monitor quando o service worker carrega
const monitor = new RequestMonitor();