// LICON Side Panel Script - Enhanced UI with better UX
class LiconSidePanel {
  constructor() {
    this.isRunning = false;
    this.isAccepting = false;
    this.currentTab = null;
    this.acceptStats = { processed: 0, accepted: 0, skipped: 0, errors: 0 };
    this.stats = {
      totalProcessed: 0,
      connectionsAttempted: 0,
      connectionsSuccessful: 0,
      profilesSkipped: 0,
      errors: 0,
      skipReasons: {
        alreadyConnected: 0,
        pending: 0,
        noConnectButton: 0,
        followOnly: 0,
        other: 0
      }
    };
    this.failedProfiles = [];
    // Track which mode started the automation so View stats update correctly
    this.automationMode = null; // 'send' | 'view'

    this.init();
  }

  async init() {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];

    // Check if we're on LinkedIn
    this.checkLinkedInPage();

    // Load current status
    await this.loadStatus();

    // Load settings
    await this.loadSettings();
    await this.loadAcceptSettings();
    await this.loadViewSettings();

    // Load failed profiles
    await this.loadFailedProfiles();

    // Setup event listeners
    this.setupEventListeners();

    // Start status polling
    this.startStatusPolling();

    // Add initial animations
    this.addInitialAnimations();
  }

  checkLinkedInPage() {
    const isLinkedIn = this.currentTab?.url?.includes('linkedin.com');
    const isCompanyPeople = this.currentTab?.url?.match(/linkedin\.com\/company\/[^\/]+\/people/);
    const isSearchPeople = this.currentTab?.url?.match(/linkedin\.com\/search\/results\/people/);
    const isInvitationManager = this.currentTab?.url?.includes('linkedin.com/mynetwork/invitation-manager');
    const isSupportedPage = isCompanyPeople || isSearchPeople;

    const introSection = document.getElementById('notLinkedInSection');
    const subTabBar = document.getElementById('connectSubTabBar');
    const appSection = document.getElementById('appSection');
    const acceptSection = document.getElementById('acceptSection');
    const openBtn = document.getElementById('openLinkedInBtn');

    if (isLinkedIn) {
      if (introSection) introSection.style.display = 'none';
      if (subTabBar) subTabBar.style.display = 'flex';

      if (isInvitationManager) {
        this.switchConnectSubTab('accept');
      } else if (isSupportedPage) {
        this.switchConnectSubTab('send');
      }
    } else {
      if (introSection) introSection.style.display = 'flex';
      if (subTabBar) subTabBar.style.display = 'none';
      if (appSection) appSection.style.display = 'none';
      if (acceptSection) acceptSection.style.display = 'none';
      if (openBtn) openBtn.textContent = 'Open LinkedIn';
    }
  }

  switchConnectSubTab(tab) {
    const sendBtn = document.getElementById('subTabSend');
    const acceptBtn = document.getElementById('subTabAccept');
    const appSection = document.getElementById('appSection');
    const acceptSection = document.getElementById('acceptSection');
    if (!sendBtn || !acceptBtn) return;

    if (tab === 'send') {
      sendBtn.classList.add('active');
      acceptBtn.classList.remove('active');
      if (appSection) appSection.style.display = 'block';
      if (acceptSection) acceptSection.style.display = 'none';
    } else {
      sendBtn.classList.remove('active');
      acceptBtn.classList.add('active');
      if (appSection) appSection.style.display = 'none';
      if (acceptSection) acceptSection.style.display = 'block';
    }
  }

  switchEngageSubTab(tab) {
    const commentBtn = document.getElementById('subTabComment');
    const viewBtn = document.getElementById('subTabView');
    const commentSection = document.getElementById('commentSection');
    const viewSection = document.getElementById('viewSection');
    if (!commentBtn || !viewBtn) return;

    if (tab === 'comment') {
      commentBtn.classList.add('active');
      viewBtn.classList.remove('active');
      if (commentSection) commentSection.style.display = 'block';
      if (viewSection) viewSection.style.display = 'none';
    } else {
      commentBtn.classList.remove('active');
      viewBtn.classList.add('active');
      if (commentSection) commentSection.style.display = 'none';
      if (viewSection) viewSection.style.display = 'block';
    }
  }

  setupEventListeners() {
    // Helper to safely add event listener
    const on = (id, event, handler) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(event, handler);
    };

    // Open LinkedIn button
    on('openLinkedInBtn', 'click', () => {
      chrome.tabs.create({ url: 'https://www.linkedin.com/search/results/people/' });
    });

    // Connect sub-tabs
    on('subTabSend', 'click', () => this.switchConnectSubTab('send'));
    on('subTabAccept', 'click', () => this.switchConnectSubTab('accept'));

    // Engage sub-tabs
    on('subTabComment', 'click', () => this.switchEngageSubTab('comment'));
    on('subTabView', 'click', () => this.switchEngageSubTab('view'));

    // Main tab switching (Connect / Engage)
    on('tabConnect', 'click', () => {
      document.getElementById('tabConnect')?.classList.add('active');
      document.getElementById('tabEngage')?.classList.remove('active');
      const ct = document.getElementById('connectTab');
      const et = document.getElementById('engageTab');
      if (ct) ct.style.display = 'block';
      if (et) et.style.display = 'none';
    });
    on('tabEngage', 'click', () => {
      document.getElementById('tabEngage')?.classList.add('active');
      document.getElementById('tabConnect')?.classList.remove('active');
      const et = document.getElementById('engageTab');
      const ct = document.getElementById('connectTab');
      if (et) et.style.display = 'block';
      if (ct) ct.style.display = 'none';
    });

    // Send automation controls
    on('startBtn', 'click', () => this.startAutomation());
    on('stopBtn', 'click', () => this.stopAutomation());

    // Send settings
    on('minDelay', 'change', () => this.saveSettings());
    on('maxDelay', 'change', () => this.saveSettings());
    on('profileLimit', 'change', () => this.saveSettings());
    on('pageLimit', 'change', () => this.saveSettings());
    on('skipConnectedToggle', 'click', () => this.toggleSetting('skipConnected'));
    on('autoScrollToggle', 'click', () => this.toggleSetting('autoScroll'));

    // Reset button
    on('resetBtn', 'click', () => this.resetStats());

    // Failed profiles actions
    on('exportFailedBtn', 'click', () => this.exportFailedProfiles());
    on('clearFailedBtn', 'click', () => this.clearFailedProfiles());

    // Accept automation controls
    on('acceptStartBtn', 'click', () => this.startAcceptAutomation());
    on('acceptStopBtn', 'click', () => this.stopAcceptAutomation());
    on('acceptResetBtn', 'click', () => this.resetAcceptStats());

    // Accept settings - toggles
    on('acceptConnectionsToggle', 'click', () => this.toggleAcceptSetting('acceptConnectionsToggle'));
    on('acceptNewslettersToggle', 'click', () => this.toggleAcceptSetting('acceptNewslettersToggle'));
    on('acceptFollowsToggle', 'click', () => this.toggleAcceptSetting('acceptFollowsToggle'));

    // Accept settings - inputs
    on('acceptMinDelay', 'change', () => this.saveAcceptSettings());
    on('acceptMaxDelay', 'change', () => this.saveAcceptSettings());
    on('acceptLimit', 'change', () => this.saveAcceptSettings());

    // View automation controls
    on('viewStartBtn', 'click', () => this.startViewAutomation());
    on('viewStopBtn', 'click', () => this.stopViewAutomation());
    on('viewResetBtn', 'click', () => this.resetViewStats());

    // View settings
    on('viewMinDelay', 'change', () => this.saveViewSettings());
    on('viewMaxDelay', 'change', () => this.saveViewSettings());
    on('viewProfileLimit', 'change', () => this.saveViewSettings());
    on('viewPageLimit', 'change', () => this.saveViewSettings());
    on('viewAutoScrollToggle', 'click', () => {
      const toggle = document.getElementById('viewAutoScrollToggle');
      if (!toggle) return;
      toggle.classList.toggle('active');
      this.saveViewSettings();
      toggle.style.transform = 'scale(0.95)';
      setTimeout(() => { toggle.style.transform = 'scale(1)'; }, 150);
    });

    // Add input validation
    const inputs = document.querySelectorAll('.setting-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => this.validateInput(e.target));
    });

    // Listen for tab changes
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      this.currentTab = tab;
      this.checkLinkedInPage();
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tabId === this.currentTab?.id && changeInfo.url) {
        this.currentTab = tab;
        this.checkLinkedInPage();
      }
    });
  }

  validateInput(input) {
    const value = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);

    if (value < min) {
      input.value = min;
      this.showToast(`Minimum value is ${min}ms`, 'warning');
    } else if (value > max) {
      input.value = max;
      this.showToast(`Maximum value is ${max}ms`, 'warning');
    }

    // Ensure max delay is always greater than min delay
    if (input.id === 'minDelay') {
      const maxDelayInput = document.getElementById('maxDelay');
      if (value >= parseInt(maxDelayInput.value)) {
        maxDelayInput.value = value + 1000;
        this.showToast('Max delay adjusted automatically', 'info');
      }
    }
    if (input.id === 'viewMinDelay') {
      const maxDelayInput = document.getElementById('viewMaxDelay');
      if (value >= parseInt(maxDelayInput.value)) {
        maxDelayInput.value = value + 1000;
        this.showToast('Max delay adjusted automatically', 'info');
      }
    }
  }

  async loadStatus() {
    try {
      const response = await this.sendMessage({ type: 'GET_STATUS' });

      if (response) {
        this.isRunning = response.isRunning;
        this.stats = response.stats || this.stats;

        // Ensure skipReasons exists
        if (!this.stats.skipReasons) {
          this.stats.skipReasons = {
            alreadyConnected: 0,
            pending: 0,
            noConnectButton: 0,
            followOnly: 0,
            other: 0
          };
        }

        // Update page info
        if (response.pageInfo) {
          const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
          set('currentPage', response.pageInfo.currentPage || 1);
          set('totalPages', response.pageInfo.totalPages || 1);
          set('viewCurrentPage', response.pageInfo.currentPage || 1);
          set('viewTotalPages', response.pageInfo.totalPages || 1);
        }

        this.updateUI();
        this.updateViewUI();

        if (response.currentCompany) {
          this.showCompanyInfo(response.currentCompany);
        }
      }
    } catch (error) {
      console.error('Failed to load status:', error);
      this.showToast('Failed to connect to LICON service', 'error');
    }
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ type: 'GET_SETTINGS' });

      if (response) {
        document.getElementById('minDelay').value = response.minDelay || 2000;
        document.getElementById('maxDelay').value = response.maxDelay || 8000;
        document.getElementById('profileLimit').value = response.profileLimit || 0;
        document.getElementById('pageLimit').value = response.pageLimit || 0;

        this.setToggle('skipConnectedToggle', response.skipConnected !== false);
        this.setToggle('autoScrollToggle', response.autoScroll !== false);

        // Detect if automation is running in view mode
        if (response.visitOnly && this.isRunning) {
          this.automationMode = 'view';
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    const settings = {
      minDelay: parseInt(document.getElementById('minDelay').value) || 2000,
      maxDelay: parseInt(document.getElementById('maxDelay').value) || 8000,
      profileLimit: parseInt(document.getElementById('profileLimit').value) || 0,
      pageLimit: parseInt(document.getElementById('pageLimit').value) || 0,
      skipConnected: this.getToggleState('skipConnectedToggle'),
      autoScroll: this.getToggleState('autoScrollToggle'),
      visitOnly: false
    };

    // Validate settings
    if (settings.minDelay >= settings.maxDelay) {
      settings.maxDelay = settings.minDelay + 1000;
      document.getElementById('maxDelay').value = settings.maxDelay;
      this.showToast('Max delay adjusted to maintain proper range', 'info');
    }

    try {
      await this.sendMessage({ type: 'SAVE_SETTINGS', data: settings });
      this.showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  async startAutomation() {
    if (!this.isSupportedLinkedInPage()) {
      this.showError('Please navigate to a LinkedIn company people page or search results first.');
      return;
    }

    try {
      const startBtn = document.getElementById('startBtn');
      startBtn.textContent = 'Starting...';
      startBtn.disabled = true;

      // Ensure visitOnly is false for send mode
      await this.sendMessage({
        type: 'SAVE_SETTINGS',
        data: {
          minDelay: parseInt(document.getElementById('minDelay').value) || 2000,
          maxDelay: parseInt(document.getElementById('maxDelay').value) || 8000,
          profileLimit: parseInt(document.getElementById('profileLimit').value) || 0,
          pageLimit: parseInt(document.getElementById('pageLimit').value) || 0,
          skipConnected: this.getToggleState('skipConnectedToggle'),
          autoScroll: this.getToggleState('autoScrollToggle'),
          visitOnly: false
        }
      });

      await this.sendMessage({
        type: 'START_AUTOMATION',
        data: {
          companyUrl: this.currentTab.url,
          tabId: this.currentTab.id
        }
      });

      this.isRunning = true;
      this.automationMode = 'send';
      this.updateUI();
      this.showCompanyInfo(this.currentTab.url);
      this.showToast('Automation started successfully!', 'success');

    } catch (error) {
      console.error('Failed to start automation:', error);
      this.showError('Failed to start automation. Please try again.');

      // Reset button state
      const startBtn = document.getElementById('startBtn');
      startBtn.textContent = 'Start';
      startBtn.disabled = false;
    }
  }

  async stopAutomation() {
    try {
      const stopBtn = document.getElementById('stopBtn');
      stopBtn.textContent = 'Stopping...';

      await this.sendMessage({ type: 'STOP_AUTOMATION' });

      this.isRunning = false;
      this.automationMode = null;
      this.updateUI();
      this.updateViewUI();
      this.showToast('Automation stopped', 'info');

    } catch (error) {
      console.error('Failed to stop automation:', error);
      this.showToast('Failed to stop automation', 'error');
    }
  }

  async resetStats() {
    if (this.isRunning) {
      this.showToast('Stop automation before resetting', 'warning');
      return;
    }

    try {
      await this.sendMessage({ type: 'RESET_STATS' });

      this.stats = {
        totalProcessed: 0,
        connectionsAttempted: 0,
        connectionsSuccessful: 0,
        profilesSkipped: 0,
        errors: 0,
        skipReasons: {
          alreadyConnected: 0,
          pending: 0,
          noConnectButton: 0,
          followOnly: 0,
          other: 0
        }
      };

      this.updateUI();
      this.showToast('Stats reset', 'success');
    } catch (error) {
      console.error('Failed to reset stats:', error);
      this.showToast('Failed to reset stats', 'error');
    }
  }

  updateUI() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const pageInfo = document.getElementById('pageInfo');
    const companyInfo = document.getElementById('companyInfo');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    const isSendRunning = this.isRunning && this.automationMode === 'send';

    if (statusDot) statusDot.className = isSendRunning ? 'status-dot active' : 'status-dot';
    if (statusText) {
      statusText.textContent = isSendRunning ? 'Running...' : 'Ready';
      isSendRunning ? statusText.classList.add('pulse') : statusText.classList.remove('pulse');
    }
    if (pageInfo) pageInfo.style.display = isSendRunning ? 'block' : 'none';
    if (!isSendRunning && companyInfo) companyInfo.style.display = 'none';

    if (startBtn) startBtn.disabled = this.isRunning;
    if (stopBtn) stopBtn.disabled = !isSendRunning;

    if (!isSendRunning) {
      if (startBtn) startBtn.textContent = 'Start';
      if (stopBtn) stopBtn.textContent = 'Stop';
    }

    this.updateStatWithAnimation('processedCount', this.stats.totalProcessed || 0);
    this.updateStatWithAnimation('connectedCount', this.stats.connectionsSuccessful || 0);
    this.updateStatWithAnimation('skippedCount', this.stats.profilesSkipped || 0);
    this.updateStatWithAnimation('errorCount', this.stats.errors || 0);

    this.updateSkipReasons();
  }

  updateSkipReasons() {
    const skipReasons = this.stats.skipReasons || {};
    const totalSkipped = this.stats.profilesSkipped || 0;
    const skipReasonsSection = document.getElementById('skipReasonsSection');
    if (!skipReasonsSection) return;

    if (totalSkipped > 0) {
      skipReasonsSection.style.display = 'block';
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('skipPending', skipReasons.pending || 0);
      set('skipFollowOnly', skipReasons.followOnly || 0);
      set('skipNoButton', skipReasons.noConnectButton || 0);
      set('skipConnected', skipReasons.alreadyConnected || 0);
    } else {
      skipReasonsSection.style.display = 'none';
    }
  }

  updateStatWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const currentValue = parseInt(element.textContent) || 0;

    if (newValue !== currentValue) {
      element.style.transform = 'scale(1.2)';
      element.style.transition = 'transform 0.2s ease';

      setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
      }, 100);
    }
  }

  showCompanyInfo(url) {
    const companyInfo = document.getElementById('companyInfo');
    const companyName = document.getElementById('companyName');
    const companyUrl = document.getElementById('companyUrl');

    // Extract company name from URL
    const match = url.match(/linkedin\.com\/company\/([^\/]+)/);
    const name = match ? match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Search Results';

    companyName.textContent = name;
    companyUrl.textContent = ' · ' + url.split('?')[0];
    companyInfo.style.display = 'block';
  }

  isLinkedInCompanyPage() {
    return this.currentTab?.url?.match(/linkedin\.com\/company\/[^\/]+\/people/);
  }

  isLinkedInSearchPage() {
    return this.currentTab?.url?.match(/linkedin\.com\/search\/results\/people/);
  }

  isSupportedLinkedInPage() {
    return this.isLinkedInCompanyPage() || this.isLinkedInSearchPage();
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';

    const styles = {
      success: { bg: '#fff', border: '#e2e0dc', color: '#1a1a1a' },
      error: { bg: '#fff', border: '#e2e0dc', color: '#c44' },
      warning: { bg: '#fff', border: '#e2e0dc', color: '#1a1a1a' },
      info: { bg: '#fff', border: '#e2e0dc', color: '#1a1a1a' }
    };

    const s = styles[type] || styles.info;

    toast.style.cssText = `
      position: fixed;
      top: 12px;
      left: 12px;
      right: 12px;
      background: ${s.bg};
      border: 1px solid ${s.border};
      color: ${s.color};
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      z-index: 10000;
      transform: translateY(-80px);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    `;

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
      toast.style.transform = 'translateY(-80px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  toggleSetting(settingName) {
    const toggleId = settingName + 'Toggle';
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;

    toggle.classList.toggle('active');
    this.saveSettings();

    toggle.style.transform = 'scale(0.95)';
    setTimeout(() => { toggle.style.transform = 'scale(1)'; }, 150);
  }

  setToggle(toggleId, active) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;
    if (active) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  getToggleState(toggleId) {
    const toggle = document.getElementById(toggleId);
    return toggle ? toggle.classList.contains('active') : false;
  }

  startStatusPolling() {
    // Poll status every 2 seconds when side panel is open
    this.statusInterval = setInterval(async () => {
      const wasRunning = this.isRunning;
      await this.loadStatus();
      await this.loadAcceptStatus();
      // Refresh failed profiles during automation AND once after it stops
      // (background tabs may finish after automation ends)
      if (this.isRunning || wasRunning) {
        await this.loadFailedProfiles();
      }
    }, 2000);
  }

  addInitialAnimations() {
    const elements = document.querySelectorAll('.section, .divider, .warning-text');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'opacity 0.3s ease';
        el.style.opacity = '1';
      }, index * 60);
    });
  }

  async sendMessage(message) {
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

  // Failed Profiles Methods
  async loadFailedProfiles() {
    try {
      const response = await this.sendMessage({ type: 'GET_FAILED_PROFILES' });
      if (response && response.failedProfiles) {
        this.failedProfiles = response.failedProfiles;
        this.renderFailedProfiles();
      }
    } catch (error) {
      console.error('Failed to load failed profiles:', error);
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderFailedProfiles() {
    const listContainer = document.getElementById('failedProfilesList');
    const badge = document.getElementById('failedCountBadge');
    if (!listContainer) return;

    if (badge) badge.textContent = this.failedProfiles.length;

    if (this.failedProfiles.length === 0) {
      listContainer.innerHTML = '<div class="failed-empty">No failed profiles</div>';
      return;
    }

    const profilesToShow = [...this.failedProfiles].reverse().slice(0, 20);

    listContainer.innerHTML = profilesToShow.map(profile => {
      const name = this.escapeHtml(profile.name || 'Unknown');
      const url = this.escapeHtml(profile.profileUrl || '#');
      const reason = this.escapeHtml(this.formatReason(profile.reason));
      const meta = this.escapeHtml(
        (profile.buttonText || '') + (profile.degree ? ' · ' + profile.degree : '')
      );
      return `
        <div class="failed-item">
          <a href="${url}" target="_blank">${name}</a>
          <span class="reason">${reason}</span>
          <div class="meta">${meta}</div>
        </div>
      `;
    }).join('');

    if (this.failedProfiles.length > 20) {
      listContainer.innerHTML += `
        <div class="failed-empty">
          +${this.failedProfiles.length - 20} more. Export to see all.
        </div>
      `;
    }
  }

  formatReason(reason) {
    const reasonMap = {
      'noConnectButton': 'No Button',
      'connectFailed': 'Connect Failed',
      'modalSendFailed': 'Modal Failed',
      'error': 'Error',
      'followOnly': 'Follow Only',
      'pending': 'Pending',
      'alreadyConnected': 'Connected'
    };
    return reasonMap[reason] || reason || 'Unknown';
  }

  async exportFailedProfiles() {
    if (this.failedProfiles.length === 0) {
      this.showToast('No failed profiles to export', 'warning');
      return;
    }

    try {
      // Create CSV content
      const headers = ['Name', 'Profile URL', 'Reason', 'Button Text', 'Degree', 'Details', 'Timestamp'];
      const rows = this.failedProfiles.map(p => [
        p.name,
        p.profileUrl,
        p.reason,
        p.buttonText || '',
        p.degree || '',
        p.details || '',
        new Date(p.timestamp).toLocaleString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `licon_failed_profiles_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.showToast(`Exported ${this.failedProfiles.length} profiles to CSV`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.showToast('Failed to export profiles', 'error');
    }
  }

  async clearFailedProfiles() {
    if (this.failedProfiles.length === 0) {
      this.showToast('No failed profiles to clear', 'info');
      return;
    }

    try {
      await this.sendMessage({ type: 'CLEAR_FAILED_PROFILES' });
      this.failedProfiles = [];
      this.renderFailedProfiles();
      this.showToast('Failed profiles cleared', 'success');
    } catch (error) {
      console.error('Failed to clear profiles:', error);
      this.showToast('Failed to clear profiles', 'error');
    }
  }

  // --- Accept Automation Methods ---

  async loadAcceptSettings() {
    try {
      const result = await chrome.storage.sync.get({
        liconAcceptSettings: {
          acceptConnections: true,
          acceptNewsletters: false,
          acceptFollows: false,
          minDelay: 1000,
          maxDelay: 3000,
          acceptLimit: 0
        }
      });
      const s = result.liconAcceptSettings;
      this.setToggle('acceptConnectionsToggle', s.acceptConnections !== false);
      this.setToggle('acceptNewslettersToggle', s.acceptNewsletters === true);
      this.setToggle('acceptFollowsToggle', s.acceptFollows === true);
      document.getElementById('acceptMinDelay').value = s.minDelay || 1000;
      document.getElementById('acceptMaxDelay').value = s.maxDelay || 3000;
      document.getElementById('acceptLimit').value = s.acceptLimit || 0;
    } catch (error) {
      console.error('Failed to load accept settings:', error);
    }
  }

  async saveAcceptSettings() {
    const settings = {
      acceptConnections: this.getToggleState('acceptConnectionsToggle'),
      acceptNewsletters: this.getToggleState('acceptNewslettersToggle'),
      acceptFollows: this.getToggleState('acceptFollowsToggle'),
      minDelay: parseInt(document.getElementById('acceptMinDelay').value) || 1000,
      maxDelay: parseInt(document.getElementById('acceptMaxDelay').value) || 3000,
      acceptLimit: parseInt(document.getElementById('acceptLimit').value) || 0
    };

    if (settings.minDelay >= settings.maxDelay) {
      settings.maxDelay = settings.minDelay + 1000;
      document.getElementById('acceptMaxDelay').value = settings.maxDelay;
    }

    try {
      await chrome.storage.sync.set({ liconAcceptSettings: settings });
    } catch (error) {
      console.error('Failed to save accept settings:', error);
    }
  }

  toggleAcceptSetting(toggleId) {
    const toggle = document.getElementById(toggleId);
    if (!toggle) return;
    toggle.classList.toggle('active');
    this.saveAcceptSettings();

    toggle.style.transform = 'scale(0.95)';
    setTimeout(() => { toggle.style.transform = 'scale(1)'; }, 150);
  }

  async startAcceptAutomation() {
    if (!this.currentTab?.url?.includes('linkedin.com/mynetwork/invitation-manager')) {
      this.showToast('Navigate to the invitation manager page first', 'warning');
      return;
    }

    try {
      const startBtn = document.getElementById('acceptStartBtn');
      startBtn.textContent = 'Starting...';
      startBtn.disabled = true;

      const settings = {
        acceptConnections: this.getToggleState('acceptConnectionsToggle'),
        acceptNewsletters: this.getToggleState('acceptNewslettersToggle'),
        acceptFollows: this.getToggleState('acceptFollowsToggle'),
        minDelay: parseInt(document.getElementById('acceptMinDelay').value) || 1000,
        maxDelay: parseInt(document.getElementById('acceptMaxDelay').value) || 3000,
        acceptLimit: parseInt(document.getElementById('acceptLimit').value) || 0
      };

      await this.sendMessage({
        type: 'START_ACCEPT_AUTOMATION',
        data: { tabId: this.currentTab.id, settings }
      });

      this.isAccepting = true;
      this.updateAcceptUI();
      this.showToast('Auto-accept started', 'success');
    } catch (error) {
      console.error('Failed to start accept automation:', error);
      this.showToast('Failed to start auto-accept', 'error');
      const startBtn = document.getElementById('acceptStartBtn');
      startBtn.textContent = 'Start';
      startBtn.disabled = false;
    }
  }

  async stopAcceptAutomation() {
    try {
      const stopBtn = document.getElementById('acceptStopBtn');
      stopBtn.textContent = 'Stopping...';

      await this.sendMessage({ type: 'STOP_ACCEPT_AUTOMATION' });

      this.isAccepting = false;
      this.updateAcceptUI();
      this.showToast('Auto-accept stopped', 'info');
    } catch (error) {
      console.error('Failed to stop accept automation:', error);
      this.showToast('Failed to stop auto-accept', 'error');
    }
  }

  async resetAcceptStats() {
    if (this.isAccepting) {
      this.showToast('Stop auto-accept before resetting', 'warning');
      return;
    }

    try {
      await this.sendMessage({ type: 'RESET_ACCEPT_STATS' });
      this.acceptStats = { processed: 0, accepted: 0, skipped: 0, errors: 0 };
      this.updateAcceptUI();
      this.showToast('Stats reset', 'success');
    } catch (error) {
      console.error('Failed to reset accept stats:', error);
    }
  }

  async loadAcceptStatus() {
    try {
      const response = await this.sendMessage({ type: 'GET_ACCEPT_STATUS' });
      if (response) {
        this.isAccepting = response.isAccepting;
        this.acceptStats = response.acceptStats || this.acceptStats;
        this.updateAcceptUI();
      }
    } catch (error) {
      console.error('Failed to load accept status:', error);
    }
  }

  updateAcceptUI() {
    const statusDot = document.getElementById('acceptStatusDot');
    const statusText = document.getElementById('acceptStatusText');
    const startBtn = document.getElementById('acceptStartBtn');
    const stopBtn = document.getElementById('acceptStopBtn');

    if (statusDot) statusDot.className = this.isAccepting ? 'status-dot active' : 'status-dot';
    if (statusText) {
      statusText.textContent = this.isAccepting ? 'Accepting...' : 'Ready';
      this.isAccepting ? statusText.classList.add('pulse') : statusText.classList.remove('pulse');
    }

    if (startBtn) startBtn.disabled = this.isAccepting;
    if (stopBtn) stopBtn.disabled = !this.isAccepting;

    if (!this.isAccepting) {
      if (startBtn) startBtn.textContent = 'Start';
      if (stopBtn) stopBtn.textContent = 'Stop';
    }

    this.updateStatWithAnimation('acceptProcessedCount', this.acceptStats.processed || 0);
    this.updateStatWithAnimation('acceptAcceptedCount', this.acceptStats.accepted || 0);
    this.updateStatWithAnimation('acceptSkippedCount', this.acceptStats.skipped || 0);
    this.updateStatWithAnimation('acceptErrorCount', this.acceptStats.errors || 0);
  }

  // --- View (Profile Visit) Automation Methods ---

  async loadViewSettings() {
    try {
      const result = await chrome.storage.sync.get({
        liconViewSettings: {
          minDelay: 2000,
          maxDelay: 8000,
          profileLimit: 0,
          pageLimit: 0,
          autoScroll: true
        }
      });
      const s = result.liconViewSettings;
      document.getElementById('viewMinDelay').value = s.minDelay || 2000;
      document.getElementById('viewMaxDelay').value = s.maxDelay || 8000;
      document.getElementById('viewProfileLimit').value = s.profileLimit || 0;
      document.getElementById('viewPageLimit').value = s.pageLimit || 0;
      this.setToggle('viewAutoScrollToggle', s.autoScroll !== false);
    } catch (error) {
      console.error('Failed to load view settings:', error);
    }
  }

  async saveViewSettings() {
    const settings = {
      minDelay: parseInt(document.getElementById('viewMinDelay').value) || 2000,
      maxDelay: parseInt(document.getElementById('viewMaxDelay').value) || 8000,
      profileLimit: parseInt(document.getElementById('viewProfileLimit').value) || 0,
      pageLimit: parseInt(document.getElementById('viewPageLimit').value) || 0,
      autoScroll: this.getToggleState('viewAutoScrollToggle')
    };

    if (settings.minDelay >= settings.maxDelay) {
      settings.maxDelay = settings.minDelay + 1000;
      document.getElementById('viewMaxDelay').value = settings.maxDelay;
    }

    try {
      await chrome.storage.sync.set({ liconViewSettings: settings });
    } catch (error) {
      console.error('Failed to save view settings:', error);
    }
  }

  async startViewAutomation() {
    if (!this.isSupportedLinkedInPage()) {
      this.showError('Please navigate to a LinkedIn company people page or search results first.');
      return;
    }

    if (this.isRunning) {
      this.showToast('Another automation is already running', 'warning');
      return;
    }

    try {
      const startBtn = document.getElementById('viewStartBtn');
      startBtn.textContent = 'Starting...';
      startBtn.disabled = true;

      // Save view settings as main settings with visitOnly=true
      const viewSettings = {
        minDelay: parseInt(document.getElementById('viewMinDelay').value) || 2000,
        maxDelay: parseInt(document.getElementById('viewMaxDelay').value) || 8000,
        profileLimit: parseInt(document.getElementById('viewProfileLimit').value) || 0,
        pageLimit: parseInt(document.getElementById('viewPageLimit').value) || 0,
        autoScroll: this.getToggleState('viewAutoScrollToggle'),
        skipConnected: false,
        visitOnly: true
      };

      await this.sendMessage({ type: 'SAVE_SETTINGS', data: viewSettings });

      await this.sendMessage({
        type: 'START_AUTOMATION',
        data: {
          companyUrl: this.currentTab.url,
          tabId: this.currentTab.id
        }
      });

      this.isRunning = true;
      this.automationMode = 'view';
      this.updateUI();
      this.updateViewUI();
      this.showToast('Profile visiting started!', 'success');

    } catch (error) {
      console.error('Failed to start view automation:', error);
      this.showError('Failed to start profile visiting. Please try again.');
      const startBtn = document.getElementById('viewStartBtn');
      startBtn.textContent = 'Start';
      startBtn.disabled = false;
    }
  }

  async stopViewAutomation() {
    try {
      const stopBtn = document.getElementById('viewStopBtn');
      stopBtn.textContent = 'Stopping...';

      await this.sendMessage({ type: 'STOP_AUTOMATION' });

      this.isRunning = false;
      this.automationMode = null;
      this.updateUI();
      this.updateViewUI();
      this.showToast('Profile visiting stopped', 'info');

    } catch (error) {
      console.error('Failed to stop view automation:', error);
      this.showToast('Failed to stop profile visiting', 'error');
    }
  }

  async resetViewStats() {
    if (this.isRunning && this.automationMode === 'view') {
      this.showToast('Stop visiting before resetting', 'warning');
      return;
    }

    try {
      await this.sendMessage({ type: 'RESET_STATS' });

      this.stats = {
        totalProcessed: 0,
        connectionsAttempted: 0,
        connectionsSuccessful: 0,
        profilesSkipped: 0,
        errors: 0,
        skipReasons: {
          alreadyConnected: 0,
          pending: 0,
          noConnectButton: 0,
          followOnly: 0,
          other: 0
        }
      };

      this.updateViewUI();
      this.showToast('Stats reset', 'success');
    } catch (error) {
      console.error('Failed to reset view stats:', error);
    }
  }

  updateViewUI() {
    const statusDot = document.getElementById('viewStatusDot');
    const statusText = document.getElementById('viewStatusText');
    const startBtn = document.getElementById('viewStartBtn');
    const stopBtn = document.getElementById('viewStopBtn');
    const pageInfo = document.getElementById('viewPageInfo');

    const isViewRunning = this.isRunning && this.automationMode === 'view';

    if (statusDot) statusDot.className = isViewRunning ? 'status-dot active' : 'status-dot';
    if (statusText) {
      statusText.textContent = isViewRunning ? 'Visiting...' : 'Ready';
      isViewRunning ? statusText.classList.add('pulse') : statusText.classList.remove('pulse');
    }
    if (pageInfo) pageInfo.style.display = isViewRunning ? 'block' : 'none';

    if (startBtn) startBtn.disabled = this.isRunning;
    if (stopBtn) stopBtn.disabled = !isViewRunning;

    if (!isViewRunning) {
      if (startBtn) startBtn.textContent = 'Start';
      if (stopBtn) stopBtn.textContent = 'Stop';
    }

    this.updateStatWithAnimation('viewProcessedCount', this.stats.totalProcessed || 0);
    this.updateStatWithAnimation('viewVisitedCount', this.stats.connectionsSuccessful || 0);
    this.updateStatWithAnimation('viewSkippedCount', this.stats.profilesSkipped || 0);
    this.updateStatWithAnimation('viewErrorCount', this.stats.errors || 0);
  }
}

// Initialize side panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.liconPanel = new LiconSidePanel();
});
