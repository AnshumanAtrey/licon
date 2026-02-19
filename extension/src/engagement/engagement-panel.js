// LICON Engagement Panel - Side panel UI logic for AI engagement tab
class LiconEngagementPanel {
  constructor() {
    this.settings = {};
    this.activityLog = [];
    this.init();
  }

  async init() {
    this.setupTabSwitching();
    await this.loadEngagementSettings();
    await this.loadVoiceStatus();
    await this.loadActivityLog();
    this.setupEventListeners();
    this.listenForStorageChanges();
  }

  setupTabSwitching() {
    const connectTabBtn = document.getElementById('tabConnect');
    const engageTabBtn = document.getElementById('tabEngage');
    const connectTab = document.getElementById('connectTab');
    const engageTab = document.getElementById('engageTab');

    if (!connectTabBtn || !engageTabBtn) return;

    connectTabBtn.addEventListener('click', () => {
      connectTabBtn.classList.add('active');
      engageTabBtn.classList.remove('active');
      connectTab.style.display = 'block';
      engageTab.style.display = 'none';
    });

    engageTabBtn.addEventListener('click', () => {
      engageTabBtn.classList.add('active');
      connectTabBtn.classList.remove('active');
      engageTab.style.display = 'block';
      connectTab.style.display = 'none';
    });
  }

  setupEventListeners() {
    // Voice training
    const trainBtn = document.getElementById('trainVoiceBtn');
    if (trainBtn) {
      trainBtn.addEventListener('click', () => this.startVoiceTraining());
    }

    // Provider change
    const providerSelect = document.getElementById('llmProvider');
    if (providerSelect) {
      providerSelect.addEventListener('change', () => this.onProviderChange());
    }

    // Test connection
    const testBtn = document.getElementById('testConnectionBtn');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testApiConnection());
    }

    // Save settings
    const saveBtn = document.getElementById('saveEngagementBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveSettings());
    }

    // Auto-post toggle
    const autoPostToggle = document.getElementById('autoPostToggle');
    if (autoPostToggle) {
      autoPostToggle.addEventListener('click', () => {
        autoPostToggle.classList.toggle('active');
      });
    }

    // Clear log
    const clearLogBtn = document.getElementById('clearLogBtn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', () => this.clearActivityLog());
    }
  }

  // --- Voice Training ---

  async startVoiceTraining() {
    const trainBtn = document.getElementById('trainVoiceBtn');
    const statusEl = document.getElementById('voiceStatus');

    trainBtn.disabled = true;
    trainBtn.textContent = 'Training...';
    statusEl.textContent = 'Opening your comments page...';
    statusEl.style.color = 'var(--text-secondary)';

    try {
      const response = await this.sendMessage({ type: 'TRAIN_VOICE' });
      if (response?.error) {
        statusEl.textContent = 'Error: ' + response.error;
        statusEl.style.color = '#c44';
      } else {
        statusEl.textContent = 'Scraping comments... This may take a moment.';
      }
    } catch (error) {
      statusEl.textContent = 'Failed to start training';
      statusEl.style.color = '#c44';
    }

    trainBtn.disabled = false;
    trainBtn.textContent = 'Train on My Comments';
  }

  async loadVoiceStatus() {
    try {
      const response = await this.sendMessage({ type: 'GET_VOICE_STATUS' });
      const statusEl = document.getElementById('voiceStatus');
      const countEl = document.getElementById('voiceCommentCount');

      if (response?.voiceProfile) {
        const profile = response.voiceProfile;
        const date = new Date(profile.lastTrainedAt).toLocaleDateString();
        statusEl.textContent = `Trained on ${profile.commentCount} comments (${date})`;
        statusEl.style.color = '#34a853';
        if (countEl) countEl.textContent = profile.commentCount;
      } else {
        statusEl.textContent = 'Not trained yet';
        statusEl.style.color = 'var(--text-dim)';
      }
    } catch (error) {
      console.error('Failed to load voice status:', error);
    }
  }

  // --- Settings ---

  async loadEngagementSettings() {
    try {
      const response = await this.sendMessage({ type: 'GET_ENGAGEMENT_SETTINGS' });
      if (response) {
        this.settings = response;
        this.populateSettingsUI(response);
      }
    } catch (error) {
      console.error('Failed to load engagement settings:', error);
    }
  }

  populateSettingsUI(settings) {
    const providerSelect = document.getElementById('llmProvider');
    const apiKeyInput = document.getElementById('llmApiKey');
    const modelSelect = document.getElementById('llmModel');
    const autoPostToggle = document.getElementById('autoPostToggle');
    const commentCountInput = document.getElementById('commentCountInput');

    if (providerSelect && settings.provider) {
      providerSelect.value = settings.provider;
      this.updateModelDropdown(settings.provider, settings.model);
    }
    if (apiKeyInput && settings.apiKey) {
      apiKeyInput.value = settings.apiKey;
    }
    if (autoPostToggle) {
      if (settings.autoPost) {
        autoPostToggle.classList.add('active');
      } else {
        autoPostToggle.classList.remove('active');
      }
    }
    if (commentCountInput && settings.commentCount) {
      commentCountInput.value = settings.commentCount;
    }
  }

  onProviderChange() {
    const provider = document.getElementById('llmProvider').value;
    this.updateModelDropdown(provider);
  }

  updateModelDropdown(provider, selectedModel) {
    const modelSelect = document.getElementById('llmModel');
    if (!modelSelect) return;

    const models = {
      openai: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' }
      ],
      gemini: [
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
        { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
      ],
      anthropic: [
        { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
        { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' }
      ]
    };

    const providerModels = models[provider] || [];
    modelSelect.innerHTML = providerModels
      .map(m => `<option value="${m.value}">${m.label}</option>`)
      .join('');

    if (selectedModel) {
      modelSelect.value = selectedModel;
    }
  }

  async testApiConnection() {
    const testBtn = document.getElementById('testConnectionBtn');
    const provider = document.getElementById('llmProvider').value;
    const apiKey = document.getElementById('llmApiKey').value.trim();

    if (!apiKey) {
      this.showEngagementToast('Please enter an API key', 'warning');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    try {
      const response = await this.sendMessage({
        type: 'TEST_LLM_CONNECTION',
        data: { provider, apiKey }
      });

      if (response?.success) {
        this.showEngagementToast('Connection successful!', 'success');
      } else {
        this.showEngagementToast(response?.message || 'Connection failed', 'error');
      }
    } catch (error) {
      this.showEngagementToast('Connection test failed', 'error');
    }

    testBtn.disabled = false;
    testBtn.textContent = 'Test';
  }

  async saveSettings() {
    const settings = {
      provider: document.getElementById('llmProvider').value,
      apiKey: document.getElementById('llmApiKey').value.trim(),
      model: document.getElementById('llmModel').value,
      autoPost: document.getElementById('autoPostToggle').classList.contains('active'),
      commentCount: parseInt(document.getElementById('commentCountInput')?.value) || 15
    };

    try {
      await this.sendMessage({
        type: 'SAVE_ENGAGEMENT_SETTINGS',
        data: settings
      });
      this.settings = settings;
      this.showEngagementToast('Settings saved', 'success');
    } catch (error) {
      this.showEngagementToast('Failed to save settings', 'error');
    }
  }

  // --- Activity Log ---

  async loadActivityLog() {
    try {
      const response = await this.sendMessage({ type: 'GET_ENGAGEMENT_LOG' });
      if (response?.log) {
        this.activityLog = response.log;
        this.renderActivityLog();
      }
    } catch (error) {
      console.error('Failed to load activity log:', error);
    }
  }

  renderActivityLog() {
    const listEl = document.getElementById('engagementLogList');
    const countEl = document.getElementById('engagementLogCount');
    if (!listEl) return;

    if (countEl) countEl.textContent = this.activityLog.length;

    if (this.activityLog.length === 0) {
      listEl.innerHTML = '<div class="failed-empty">No activity yet</div>';
      return;
    }

    const items = [...this.activityLog].reverse().slice(0, 50);
    listEl.innerHTML = items.map(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const actionLabel = entry.action === 'auto_posted' ? 'Auto-posted' : 'Generated';
      const actionColor = entry.action === 'auto_posted' ? '#34a853' : 'var(--text-secondary)';
      const snippet = this.escapeHtml((entry.postSnippet || '').slice(0, 60));
      const reply = this.escapeHtml((entry.reply || '').slice(0, 80));

      return `
        <div class="failed-item">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:600;color:${actionColor};font-size:11px;">${actionLabel}</span>
            <span class="reason">${time}</span>
          </div>
          <div class="meta" style="margin-top:4px;">To: ${this.escapeHtml(entry.author || 'Unknown')}</div>
          <div class="meta" style="margin-top:2px;font-style:italic;">"${reply}..."</div>
        </div>
      `;
    }).join('');
  }

  async clearActivityLog() {
    try {
      await this.sendMessage({ type: 'CLEAR_ENGAGEMENT_LOG' });
      this.activityLog = [];
      this.renderActivityLog();
      this.showEngagementToast('Activity log cleared', 'success');
    } catch (error) {
      this.showEngagementToast('Failed to clear log', 'error');
    }
  }

  // --- Storage Listener ---

  listenForStorageChanges() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.liconEngagement) {
          this.loadVoiceStatus();
        }
        if (changes.liconEngagementLog) {
          const newLog = changes.liconEngagementLog.newValue;
          if (newLog) {
            this.activityLog = newLog;
            this.renderActivityLog();
          }
        }
      }
    });
  }

  // --- Utilities ---

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  showEngagementToast(message, type) {
    // Reuse the existing side panel toast if available
    if (window.liconPanel && window.liconPanel.showToast) {
      window.liconPanel.showToast(message, type);
    }
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Initialize engagement panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.liconEngagementPanel = new LiconEngagementPanel();
});
