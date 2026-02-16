// LICON Side Panel Script - Enhanced UI with better UX
class LiconSidePanel {
  constructor() {
    this.isRunning = false;
    this.currentTab = null;
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
    const isSupportedPage = isCompanyPeople || isSearchPeople;

    const introSection = document.getElementById('notLinkedInSection');
    const appSection = document.getElementById('appSection');
    const openBtn = document.getElementById('openLinkedInBtn');

    if (isSupportedPage) {
      introSection.style.display = 'none';
      appSection.style.display = 'block';
    } else {
      introSection.style.display = 'flex';
      appSection.style.display = 'none';

      if (isLinkedIn) {
        openBtn.textContent = 'Open LinkedIn Search';
      } else {
        openBtn.textContent = 'Open LinkedIn';
      }
    }
  }

  setupEventListeners() {
    // Open LinkedIn button
    document.getElementById('openLinkedInBtn').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://www.linkedin.com/search/results/people/' });
    });

    // Control buttons
    document.getElementById('startBtn').addEventListener('click', () => this.startAutomation());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopAutomation());

    // Settings
    document.getElementById('minDelay').addEventListener('change', () => this.saveSettings());
    document.getElementById('maxDelay').addEventListener('change', () => this.saveSettings());
    document.getElementById('profileLimit').addEventListener('change', () => this.saveSettings());
    document.getElementById('pageLimit').addEventListener('change', () => this.saveSettings());
    document.getElementById('skipConnectedToggle').addEventListener('click', () => this.toggleSetting('skipConnected'));
    document.getElementById('autoScrollToggle').addEventListener('click', () => this.toggleSetting('autoScroll'));

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => this.resetStats());

    // Failed profiles actions
    document.getElementById('exportFailedBtn').addEventListener('click', () => this.exportFailedProfiles());
    document.getElementById('clearFailedBtn').addEventListener('click', () => this.clearFailedProfiles());

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
          document.getElementById('currentPage').textContent = response.pageInfo.currentPage || 1;
          document.getElementById('totalPages').textContent = response.pageInfo.totalPages || 1;
        }

        this.updateUI();

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
      autoScroll: this.getToggleState('autoScrollToggle')
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

      await this.sendMessage({
        type: 'START_AUTOMATION',
        data: {
          companyUrl: this.currentTab.url,
          tabId: this.currentTab.id
        }
      });
      
      this.isRunning = true;
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
      this.updateUI();
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
    // Update status indicator
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    const pageInfo = document.getElementById('pageInfo');

    if (this.isRunning) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Running...';
      statusText.classList.add('pulse');
      pageInfo.style.display = 'block';
    } else {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Ready';
      statusText.classList.remove('pulse');
      pageInfo.style.display = 'none';
      document.getElementById('companyInfo').style.display = 'none';
    }

    // Update buttons
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    startBtn.disabled = this.isRunning;
    stopBtn.disabled = !this.isRunning;

    if (!this.isRunning) {
      startBtn.textContent = 'Start';
      stopBtn.textContent = 'Stop';
    }
    
    // Update stats with animations
    this.updateStatWithAnimation('processedCount', this.stats.totalProcessed || 0);
    this.updateStatWithAnimation('connectedCount', this.stats.connectionsSuccessful || 0);
    this.updateStatWithAnimation('skippedCount', this.stats.profilesSkipped || 0);
    this.updateStatWithAnimation('errorCount', this.stats.errors || 0);

    // Update skip reasons breakdown
    this.updateSkipReasons();
  }

  updateSkipReasons() {
    const skipReasons = this.stats.skipReasons || {};
    const totalSkipped = this.stats.profilesSkipped || 0;

    // Show/hide skip reasons section based on whether there are skipped profiles
    const skipReasonsSection = document.getElementById('skipReasonsSection');
    if (totalSkipped > 0) {
      skipReasonsSection.style.display = 'block';

      document.getElementById('skipPending').textContent = skipReasons.pending || 0;
      document.getElementById('skipFollowOnly').textContent = skipReasons.followOnly || 0;
      document.getElementById('skipNoButton').textContent = skipReasons.noConnectButton || 0;
      document.getElementById('skipConnected').textContent = skipReasons.alreadyConnected || 0;
    } else {
      skipReasonsSection.style.display = 'none';
    }
  }

  updateStatWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
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
    
    toggle.classList.toggle('active');
    this.saveSettings();
    
    // Add click animation
    toggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
      toggle.style.transform = 'scale(1)';
    }, 150);
  }

  setToggle(toggleId, active) {
    const toggle = document.getElementById(toggleId);
    if (active) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  getToggleState(toggleId) {
    return document.getElementById(toggleId).classList.contains('active');
  }

  startStatusPolling() {
    // Poll status every 2 seconds when side panel is open
    this.statusInterval = setInterval(async () => {
      const wasRunning = this.isRunning;
      await this.loadStatus();
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

    badge.textContent = this.failedProfiles.length;

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
}

// Initialize side panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.liconPanel = new LiconSidePanel();
});