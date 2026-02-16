// LICON Background Service Worker
importScripts('../engagement/llm-client.js');
console.log('🔥 LICON: Background service worker starting...');

class LiconBackground {
  constructor() {
    console.log('🔥 LICON: Initializing background service worker...');
    this.isRunning = false;
    this.currentCompany = null;
    this.activeTabId = null;
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
    this.llmClient = new LiconLLMClient();
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
            activeTabId: this.activeTabId || null,
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

        case 'CHECK_ACTIVE_TAB':
          // Content script asks: am I the tab that should be running automation?
          const isActive = !this.activeTabId || sender.tab?.id === this.activeTabId;
          console.log(`🔍 LICON: Tab ${sender.tab?.id} checking active status: ${isActive} (activeTab: ${this.activeTabId})`);
          sendResponse({ isActiveTab: isActive });
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

        // --- Engagement message handlers ---

        case 'SAVE_ENGAGEMENT_SETTINGS':
          await chrome.storage.sync.set({ liconEngagementSettings: message.data });
          sendResponse({ success: true });
          break;

        case 'GET_ENGAGEMENT_SETTINGS':
          const engSettings = await chrome.storage.sync.get({ liconEngagementSettings: {
            provider: 'openai', apiKey: '', model: 'gpt-4o-mini',
            autoPost: false, commentCount: 15
          }});
          sendResponse(engSettings.liconEngagementSettings);
          break;

        case 'TEST_LLM_CONNECTION':
          const testResult = await this.llmClient.testConnection(
            message.data.provider, message.data.apiKey
          );
          sendResponse(testResult);
          break;

        case 'TRAIN_VOICE':
          try {
            const voiceTab = await chrome.tabs.create({
              url: 'https://www.linkedin.com/in/me/recent-activity/comments/',
              active: false
            });
            const onVoiceTabReady = (updatedTabId, changeInfo) => {
              if (updatedTabId === voiceTab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(onVoiceTabReady);
                chrome.scripting.executeScript({
                  target: { tabId: voiceTab.id },
                  files: ['src/engagement/voice-trainer.js']
                }).catch(err => {
                  console.error('LICON: Failed to inject voice trainer:', err);
                  chrome.tabs.remove(voiceTab.id).catch(() => {});
                });
              }
            };
            chrome.tabs.onUpdated.addListener(onVoiceTabReady);
            setTimeout(() => {
              chrome.tabs.onUpdated.removeListener(onVoiceTabReady);
              chrome.tabs.remove(voiceTab.id).catch(() => {});
            }, 60000);
            sendResponse({ success: true });
          } catch (err) {
            sendResponse({ error: err.message });
          }
          break;

        case 'VOICE_TRAINING_COMPLETE':
          if (message.data?.success && message.data.voiceProfile) {
            await chrome.storage.local.set({
              liconEngagement: { voiceProfile: message.data.voiceProfile }
            });
            console.log('LICON: Voice training complete -', message.data.voiceProfile.commentCount, 'comments');
          } else {
            console.error('LICON: Voice training failed:', message.data?.error);
          }
          sendResponse({ success: true });
          break;

        case 'GET_VOICE_STATUS':
          const engData = await chrome.storage.local.get({ liconEngagement: {} });
          sendResponse({ voiceProfile: engData.liconEngagement?.voiceProfile || null });
          break;

        case 'GENERATE_REPLY':
          try {
            const engCfg = await chrome.storage.sync.get({ liconEngagementSettings: {} });
            const cfg = engCfg.liconEngagementSettings;
            if (!cfg.apiKey) {
              sendResponse({ error: 'No API key configured. Open Engage tab to set up.' });
              break;
            }
            const voiceData = await chrome.storage.local.get({ liconEngagement: {} });
            const voiceProfile = voiceData.liconEngagement?.voiceProfile || null;
            const systemPrompt = this.llmClient.buildStyleSystemPrompt(voiceProfile);
            const userPrompt = this.llmClient.buildReplyUserPrompt(
              message.data.postText, message.data.postAuthor
            );
            const rawReply = await this.llmClient.generate(
              cfg.provider, cfg.apiKey, systemPrompt, userPrompt, cfg.model
            );
            const reply = this.llmClient.cleanReply(rawReply);
            sendResponse({ reply });
          } catch (err) {
            console.error('LICON: Generate reply error:', err);
            sendResponse({ error: err.message });
          }
          break;

        case 'ENGAGEMENT_ACTIVITY':
          try {
            const logData = await chrome.storage.local.get({ liconEngagementLog: [] });
            const log = logData.liconEngagementLog || [];
            log.push({
              id: `eng_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              ...message.data
            });
            // Cap at 100 entries
            while (log.length > 100) log.shift();
            await chrome.storage.local.set({ liconEngagementLog: log });
            sendResponse({ success: true });
          } catch (err) {
            sendResponse({ error: err.message });
          }
          break;

        case 'GET_ENGAGEMENT_LOG':
          const logResult = await chrome.storage.local.get({ liconEngagementLog: [] });
          sendResponse({ log: logResult.liconEngagementLog || [] });
          break;

        case 'CLEAR_ENGAGEMENT_LOG':
          await chrome.storage.local.set({ liconEngagementLog: [] });
          sendResponse({ success: true });
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
    this.activeTabId = data.tabId || null; // Track which tab is being automated
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

    // Only start automation on the specific tab the user is viewing
    if (this.activeTabId) {
      console.log(`📡 LICON: Starting automation on tab ${this.activeTabId} only`);
      await this.sendToTab(this.activeTabId, { type: 'AUTOMATION_STARTED' });
    } else {
      // Fallback: broadcast to all (shouldn't happen with updated side panel)
      console.log('📡 LICON: No specific tab — broadcasting to all LinkedIn tabs...');
      await this.broadcastToLinkedInTabs({ type: 'AUTOMATION_STARTED' });
    }
    console.log('✅ LICON: Automation started successfully');
  }

  async stopAutomation() {
    this.isRunning = false;
    this.currentCompany = null;
    this.activeTabId = null;

    await chrome.storage.local.set({
      liconState: {
        isRunning: false,
        currentCompany: null,
        stats: this.stats
      }
    });

    // Notify all LinkedIn tabs to stop
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
    if (data.needsProfileVisit) {
      const newTab = await chrome.tabs.create({
        url: data.profileUrl,
        active: false
      });

      // Wait for tab to fully load before injecting
      const onTabUpdated = (updatedTabId, changeInfo) => {
        if (updatedTabId === newTab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(onTabUpdated);
          chrome.scripting.executeScript({
            target: { tabId: newTab.id },
            files: ['src/content/profile-connector.js']
          }).catch(error => {
            console.error('Failed to inject profile connector:', error);
            chrome.tabs.remove(newTab.id);
          });
        }
      };
      chrome.tabs.onUpdated.addListener(onTabUpdated);

      // Safety timeout - clean up listener and close orphaned tab if it never loads
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onTabUpdated);
        chrome.tabs.remove(newTab.id).catch(() => {});
      }, 30000);
    }
  }

  async handleTabUpdate(tabId, tab) {
    // Inject feed injector on LinkedIn feed pages (regardless of automation state)
    const isFeedPage = tab.url?.match(/linkedin\.com\/feed/);
    if (isFeedPage) {
      try {
        const engCfg = await chrome.storage.sync.get({ liconEngagementSettings: {} });
        if (engCfg.liconEngagementSettings?.apiKey) {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['src/engagement/feed-injector.js']
          });
        }
      } catch (error) {
        // Script might already be injected
      }
    }

    if (!this.isRunning) return;

    // Only auto-inject into the tab that's being automated (not all LinkedIn tabs)
    if (this.activeTabId && tabId !== this.activeTabId) return;

    // Check if this is a supported LinkedIn page (company people or search results)
    const isCompanyPage = tab.url?.match(/linkedin\.com\/company\/[^\/]+\/people/);
    const isSearchPage = tab.url?.match(/linkedin\.com\/search\/results\/people/);

    if (isCompanyPage || isSearchPage) {
      // Update activeTabId in case of search pagination (same tab, new URL)
      this.activeTabId = tabId;
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

  async sendToTab(tabId, message) {
    try {
      // Check if content script is loaded
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      } catch (e) {
        // Not loaded — inject it
        console.log(`📤 LICON: Injecting content script into tab ${tabId}...`);
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['src/content/main-automator.js']
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Send the message with retries
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await chrome.tabs.sendMessage(tabId, message);
          console.log(`✅ LICON: Message "${message.type}" sent to tab ${tabId}`, response);
          return;
        } catch (error) {
          retries--;
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      console.error(`❌ LICON: Failed to send "${message.type}" to tab ${tabId} after all retries`);
    } catch (error) {
      console.error(`❌ LICON: Error sending to tab ${tabId}:`, error.message);
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
      // Never restore isRunning - content scripts are dead after worker restart
      // User must click Start again to resume
      this.isRunning = false;
      this.currentCompany = null;
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

      // Clear stale running state from storage
      if (result.liconState.isRunning) {
        await chrome.storage.local.set({
          liconState: {
            isRunning: false,
            currentCompany: null,
            stats: this.stats
          }
        });
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