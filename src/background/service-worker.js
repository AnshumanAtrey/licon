// LICON Background Service Worker
console.log('🔥 LICON: Background service worker starting...');

class LiconBackground {
  constructor() {
    console.log('🔥 LICON: Initializing background service worker...');
    this.isRunning = false;
    this.currentCompany = null;
    this.pageInfo = { currentPage: 1, totalPages: 1 };
    this.pagesProcessed = 0;
    this.stats = {
      totalProcessed: 0,
      connectionsAttempted: 0,
      connectionsSuccessful: 0,
      profilesSkipped: 0,
      errors: 0,
      // Detailed skip reasons
      skipReasons: {
        alreadyConnected: 0,
        pending: 0,
        noConnectButton: 0,
        followOnly: 0,
        other: 0
      }
    };
    this.failedProfiles = [];
    this.setupListeners();
    console.log('✅ LICON: Background service worker initialized successfully');
  }

  setupListeners() {
    console.log('🔧 LICON: Setting up background listeners...');
    
    // Handle messages from content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 LICON: Received message:', message.type, 'from:', sender.tab?.url || 'popup');
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com')) {
        console.log('🔄 LICON: LinkedIn tab updated:', tab.url);
        this.handleTabUpdate(tabId, tab);
      }
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      console.log('🚀 LICON: Extension startup detected');
      this.initializeExtension();
    });

    chrome.runtime.onInstalled.addListener((details) => {
      console.log('📦 LICON: Extension installed/updated:', details.reason);
      this.initializeExtension();
    });

    // Handle action click to open side panel
    chrome.action.onClicked.addListener((tab) => {
      console.log('🔥 LICON: Extension icon clicked, opening side panel');
      chrome.sidePanel.open({ windowId: tab.windowId });
    });
    
    console.log('✅ LICON: Background listeners setup complete');
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      console.log(`🔧 LICON: Processing message type: ${message.type}`);
      
      switch (message.type) {
        case 'START_AUTOMATION':
          console.log('🚀 LICON: Starting automation from background...');
          await this.startAutomation(message.data);
          sendResponse({ success: true });
          break;

        case 'STOP_AUTOMATION':
          console.log('🛑 LICON: Stopping automation from background...');
          await this.stopAutomation();
          sendResponse({ success: true });
          break;

        case 'GET_STATUS':
          const status = {
            isRunning: this.isRunning,
            currentCompany: this.currentCompany,
            stats: this.stats,
            pageInfo: this.pageInfo,
            pagesProcessed: this.pagesProcessed
          };
          console.log('📊 LICON: Sending status:', status);
          sendResponse(status);
          break;

        case 'PROFILE_PROCESSED':
          console.log('📈 LICON: Updating stats:', message.data);
          this.updateStats(message.data);
          sendResponse({ success: true });
          break;

        case 'PAGE_INFO_UPDATE':
          console.log('📄 LICON: Page info update:', message.data);
          this.pageInfo = message.data;
          this.pagesProcessed = (this.pagesProcessed || 0);
          sendResponse({ success: true });
          break;

        case 'CONNECTION_ATTEMPT':
          console.log('🔗 LICON: Handling connection attempt:', message.data);
          await this.handleConnectionAttempt(message.data, sender.tab?.id);
          sendResponse({ success: true });
          break;

        case 'GET_SETTINGS':
          const settings = await this.getSettings();
          console.log('⚙️ LICON: Sending settings:', settings);
          sendResponse(settings);
          break;

        case 'SAVE_SETTINGS':
          console.log('💾 LICON: Saving settings:', message.data);
          await this.saveSettings(message.data);
          sendResponse({ success: true });
          break;

        case 'CLOSE_TAB':
          if (sender.tab) {
            console.log('🗙 LICON: Closing tab:', sender.tab.id);
            chrome.tabs.remove(sender.tab.id);
          }
          sendResponse({ success: true });
          break;

        case 'ADD_FAILED_PROFILE':
          console.log('❌ LICON: Adding failed profile:', message.data);
          this.addFailedProfile(message.data);
          sendResponse({ success: true });
          break;

        case 'GET_FAILED_PROFILES':
          console.log('📋 LICON: Sending failed profiles:', this.failedProfiles.length);
          sendResponse({ failedProfiles: this.failedProfiles });
          break;

        case 'RESET_STATS':
          console.log('🔄 LICON: Resetting stats');
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
          this.pagesProcessed = 0;
          this.pageInfo = { currentPage: 1, totalPages: 1 };
          await chrome.storage.local.set({
            liconState: {
              isRunning: this.isRunning,
              currentCompany: this.currentCompany,
              stats: this.stats
            }
          });
          sendResponse({ success: true });
          break;

        case 'CLEAR_FAILED_PROFILES':
          console.log('🗑️ LICON: Clearing failed profiles');
          this.failedProfiles = [];
          await chrome.storage.local.set({ liconFailedProfiles: [] });
          sendResponse({ success: true });
          break;

        case 'EXPORT_FAILED_PROFILES':
          console.log('📤 LICON: Exporting failed profiles');
          sendResponse({ failedProfiles: this.failedProfiles });
          break;

        default:
          console.log('❓ LICON: Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type: ' + message.type });
      }
    } catch (error) {
      console.error('❌ LICON: Background script error:', error);
      sendResponse({ error: error.message });
    }
  }

  async startAutomation(data) {
    if (this.isRunning) {
      throw new Error('Automation is already running');
    }

    console.log('🚀 LICON: Starting automation for:', data.companyUrl);
    this.isRunning = true;
    this.currentCompany = data.companyUrl;
    this.pageInfo = { currentPage: 1, totalPages: 1 };
    this.pagesProcessed = 0;

    // Reset stats for new session
    this.stats = {
      totalProcessed: 0,
      connectionsAttempted: 0,
      connectionsSuccessful: 0,
      profilesSkipped: 0,
      errors: 0,
      startTime: Date.now(),
      // Detailed skip reasons
      skipReasons: {
        alreadyConnected: 0,
        pending: 0,
        noConnectButton: 0,
        followOnly: 0,
        other: 0
      }
    };
    // Clear failed profiles for new session
    this.failedProfiles = [];

    // Save state
    await chrome.storage.local.set({
      liconState: {
        isRunning: true,
        currentCompany: this.currentCompany,
        stats: this.stats
      }
    });

    console.log('📡 LICON: Broadcasting automation start message...');
    // Notify all LinkedIn tabs
    await this.broadcastToLinkedInTabs({ type: 'AUTOMATION_STARTED' });
    console.log('✅ LICON: Automation started successfully');
  }

  async stopAutomation() {
    this.isRunning = false;
    this.currentCompany = null;

    await chrome.storage.local.set({
      liconState: {
        isRunning: false,
        currentCompany: null,
        stats: this.stats
      }
    });

    // Notify all LinkedIn tabs
    this.broadcastToLinkedInTabs({ type: 'AUTOMATION_STOPPED' });
  }

  updateStats(data) {
    if (data.processed) this.stats.totalProcessed++;
    if (data.attempted) this.stats.connectionsAttempted++;
    if (data.successful) this.stats.connectionsSuccessful++;
    if (data.skipped) this.stats.profilesSkipped++;
    if (data.error) this.stats.errors++;
    if (data.pageCompleted) this.pagesProcessed++;

    // Track detailed skip reasons
    if (data.skipReason && this.stats.skipReasons) {
      switch (data.skipReason) {
        case 'alreadyConnected':
          this.stats.skipReasons.alreadyConnected++;
          break;
        case 'pending':
          this.stats.skipReasons.pending++;
          break;
        case 'noConnectButton':
          this.stats.skipReasons.noConnectButton++;
          break;
        case 'followOnly':
          this.stats.skipReasons.followOnly++;
          break;
        default:
          this.stats.skipReasons.other++;
      }
    }

    // Save updated stats
    chrome.storage.local.set({
      liconState: {
        isRunning: this.isRunning,
        currentCompany: this.currentCompany,
        stats: this.stats
      }
    });
  }

  addFailedProfile(profileData) {
    // Avoid duplicates
    const exists = this.failedProfiles.some(p => p.profileUrl === profileData.profileUrl);
    if (!exists) {
      this.failedProfiles.push({
        ...profileData,
        timestamp: Date.now(),
        id: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      // Save to storage
      chrome.storage.local.set({ liconFailedProfiles: this.failedProfiles });
    }
  }

  async handleConnectionAttempt(data, tabId) {
    // Handle connection attempt in background
    // This could involve opening new tabs for profiles that need "More" -> "Connect"
    
    if (data.needsProfileVisit) {
      // Open profile in new background tab
      const newTab = await chrome.tabs.create({
        url: data.profileUrl,
        active: false // Don't steal focus
      });

      // Wait for tab to load and inject connection script
      setTimeout(async () => {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            files: ['src/content/profile-connector.js']
          });
        } catch (error) {
          console.error('Failed to inject profile connector:', error);
          chrome.tabs.remove(newTab.id);
        }
      }, 2000);
    }
  }

  async handleTabUpdate(tabId, tab) {
    if (!this.isRunning) return;

    // Check if this is a supported LinkedIn page (company people or search results)
    const isCompanyPage = tab.url?.match(/linkedin\.com\/company\/[^\/]+\/people/);
    const isSearchPage = tab.url?.match(/linkedin\.com\/search\/results\/people/);

    if (isCompanyPage || isSearchPage) {
      // Inject our content script if not already present
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['src/content/main-automator.js']
        });
      } catch (error) {
        // Script might already be injected
        console.log('Content script injection skipped:', error.message);
      }
    }
  }

  async broadcastToLinkedInTabs(message) {
    const tabs = await chrome.tabs.query({ url: '*://www.linkedin.com/*' });
    console.log(`🔄 LICON: Broadcasting message "${message.type}" to ${tabs.length} LinkedIn tabs`);
    
    for (const tab of tabs) {
      try {
        // Process company people pages AND search results pages
        const isCompanyPage = tab.url?.match(/linkedin\.com\/company\/[^\/]+\/people/);
        const isSearchPage = tab.url?.match(/linkedin\.com\/search\/results\/people/);

        if (isCompanyPage || isSearchPage) {
          console.log(`📤 LICON: Processing tab ${tab.id}: ${tab.url}`);
          
          // Test if content script is already loaded by sending a ping
          let contentScriptLoaded = false;
          try {
            console.log(`🧪 LICON: Testing if content script exists in tab ${tab.id}...`);
            const pingResponse = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
            contentScriptLoaded = !!pingResponse;
            console.log(`✅ LICON: Content script already loaded in tab ${tab.id}`);
          } catch (error) {
            console.log(`📤 LICON: Content script not loaded in tab ${tab.id}, injecting...`);
            
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['src/content/main-automator.js']
              });
              console.log(`✅ LICON: Content script injected to tab ${tab.id}`);
              
              // Wait longer for script to initialize after injection
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (injectError) {
              console.error(`❌ LICON: Failed to inject content script to tab ${tab.id}:`, injectError.message);
              continue;
            }
          }
          
          // Send the message with retry logic
          let retries = 3;
          let messageSent = false;
          
          while (retries > 0 && !messageSent) {
            try {
              console.log(`📨 LICON: Sending "${message.type}" to tab ${tab.id} (attempt ${4 - retries})`);
              const response = await chrome.tabs.sendMessage(tab.id, message);
              console.log(`✅ LICON: Message sent successfully to tab ${tab.id}`, response);
              messageSent = true;
            } catch (error) {
              retries--;
              console.log(`❌ LICON: Failed to send message to tab ${tab.id} (${retries} retries left):`, error.message);
              
              if (retries > 0) {
                console.log(`⏳ LICON: Waiting 1 second before retry...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (!messageSent) {
            console.error(`❌ LICON: Failed to send message to tab ${tab.id} after all retries`);
          }
        }
        
      } catch (error) {
        console.error(`❌ LICON: Error processing tab ${tab.id}:`, error.message);
      }
    }
  }

  async getSettings() {
    const result = await chrome.storage.sync.get({
      liconSettings: {
        minDelay: 2000,
        maxDelay: 8000,
        profileLimit: 0, // 0 = unlimited
        pageLimit: 0, // 0 = unlimited
        respectRateLimits: true,
        autoScroll: true,
        skipConnected: true
      }
    });
    return result.liconSettings;
  }

  async saveSettings(settings) {
    await chrome.storage.sync.set({ liconSettings: settings });
  }

  async initializeExtension() {
    // Restore state if extension was restarted
    const result = await chrome.storage.local.get(['liconState', 'liconFailedProfiles']);
    if (result.liconState) {
      this.isRunning = result.liconState.isRunning || false;
      this.currentCompany = result.liconState.currentCompany || null;
      this.stats = result.liconState.stats || this.stats;

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
    }

    // Restore failed profiles
    if (result.liconFailedProfiles) {
      this.failedProfiles = result.liconFailedProfiles;
    }
  }
}

// Initialize background script with error handling
try {
  console.log('🔥 LICON: Initializing background script...');
  const liconBackground = new LiconBackground();
  console.log('✅ LICON: Background script initialized successfully');
} catch (error) {
  console.error('❌ LICON: Failed to initialize background script:', error);
}