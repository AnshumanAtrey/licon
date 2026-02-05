// LICON Main Content Script - Accurate LinkedIn Automation
(function() {
if (window.__liconLoaded) {
  // Check if extension context is still valid (invalidated after extension reload)
  if (!chrome.runtime?.id) {
    console.log('🔄 LICON: Extension context invalidated, re-initializing...');
    window.__liconLoaded = false;
    // Fall through to re-initialize
  } else if (window.__liconLastUrl !== window.location.href) {
    // URL changed (SPA navigation like search pagination)
    console.log('🔄 LICON: URL changed (SPA navigation), re-initializing on new page...');
    window.__liconLastUrl = window.location.href;
    if (window.liconAutomator) {
      window.liconAutomator.pageType = null;
      window.liconAutomator.processed.clear();
      window.liconAutomator.isRunning = false;
      window.liconAutomator.init();
    }
    return;
  } else {
    console.log('🔁 LICON: Content script already loaded, skipping');
    return;
  }
}
window.__liconLoaded = true;
window.__liconLastUrl = window.location.href;

class LiconMainAutomator {
  constructor() {
    console.log('🔧 LICON: LiconMainAutomator constructor called');

    this.isRunning = false;
    this.processed = new Set();
    this.currentPage = 1;
    this.totalPages = 1;
    this.pagesProcessed = 0;
    this.totalProfilesProcessed = 0;
    this.settings = {};
    this.pageType = null; // 'company' | 'search' | 'unknown'

    console.log('🔧 LICON: Setting up message listener...');
    this.setupMessageListener();

    console.log('🔧 LICON: Initializing automator...');
    this.init();

    console.log('✅ LICON: LiconMainAutomator constructor completed');
  }

  async init() {
    console.log('🔧 LICON: Initializing LiconMainAutomator...');

    try {
      // Get settings from background
      console.log('⚙️ LICON: Getting settings from background...');
      this.settings = await this.sendMessage({ type: 'GET_SETTINGS' });
      console.log('✅ LICON: Settings received:', this.settings);

      // Detect page type
      this.pageType = this.detectPageType();
      console.log('🔍 LICON: Detected page type:', this.pageType);

      if (this.pageType !== 'unknown') {
        console.log('📊 LICON: Detecting page info...');
        this.detectPageInfo();
        console.log('✅ LICON: Ready on LinkedIn', this.pageType, 'page');
        console.log('📊 LICON: Page info - Current:', this.currentPage, 'Total:', this.totalPages);

        // Check if automation is running in background and should continue
        await this.checkAndContinueAutomation();
      } else {
        console.log('⚠️ LICON: Not on a supported LinkedIn page');
      }
    } catch (error) {
      console.error('❌ LICON: Error during initialization:', error);
    }
  }

  async checkAndContinueAutomation() {
    try {
      const status = await this.sendMessage({ type: 'GET_STATUS' });
      console.log('🔍 LICON: Background status:', status);

      if (status && status.isRunning) {
        console.log('🔄 LICON: Automation is running in background - continuing on this page...');

        // Restore counters from background state
        if (status.stats) {
          this.totalProfilesProcessed = status.stats.totalProcessed || 0;
          this.pagesProcessed = status.pagesProcessed || 0;
        }

        // Restore settings from background
        this.settings = await this.sendMessage({ type: 'GET_SETTINGS' }) || this.settings;

        // Small delay to let the page fully load
        await this.sleep(2000);
        await this.startAutomation();
      }
    } catch (error) {
      console.error('❌ LICON: Error checking automation status:', error);
    }
  }

  setupMessageListener() {
    console.log('🔧 LICON: Setting up message listener in LiconMainAutomator...');
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 LICON: LiconMainAutomator received message:', message);
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
    
    console.log('✅ LICON: Message listener set up in LiconMainAutomator');
  }

  async handleMessage(message, sender, sendResponse) {
    console.log(`📨 LICON: Content script handling message: ${message.type}`);
    console.log('📨 LICON: Full message object:', message);
    console.log('📨 LICON: Sender:', sender);
    
    try {
      switch (message.type) {
        case 'PING':
          console.log('🏓 LICON: Received PING, responding with PONG');
          sendResponse({ success: true, message: 'PONG', timestamp: Date.now() });
          break;
          
        case 'AUTOMATION_STARTED':
          console.log('🚀 LICON: Content script received AUTOMATION_STARTED - starting automation...');
          console.log('🔍 LICON: Current isRunning state:', this.isRunning);
          if (this.isRunning) {
            console.log('⚠️ LICON: Already running, skipping duplicate start');
            sendResponse({ success: true, message: 'Already running' });
            break;
          }
          // Reset counters for new session
          this.pagesProcessed = 0;
          this.totalProfilesProcessed = 0;
          this.processed.clear();
          // Refresh settings in case user changed them
          this.settings = await this.sendMessage({ type: 'GET_SETTINGS' }) || this.settings;
          await this.startAutomation();
          console.log('✅ LICON: Automation started successfully');
          sendResponse({ success: true, message: 'Automation started' });
          break;
        
        case 'AUTOMATION_STOPPED':
          console.log('🛑 LICON: Content script received AUTOMATION_STOPPED - stopping automation...');
          this.stopAutomation();
          console.log('✅ LICON: Automation stopped successfully');
          sendResponse({ success: true, message: 'Automation stopped' });
          break;
        
        default:
          console.log(`❓ LICON: Unknown message type: ${message.type}`);
          sendResponse({ success: true, message: 'Unknown message type' });
      }
    } catch (error) {
      console.error('❌ LICON: Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  detectPageType() {
    const url = window.location.href;

    if (url.match(/linkedin\.com\/company\/[^\/]+\/people/)) {
      return 'company';
    } else if (url.match(/linkedin\.com\/search\/results\/people/)) {
      return 'search';
    }
    return 'unknown';
  }

  isCompanyPeoplePage() {
    return this.pageType === 'company';
  }

  isSearchResultsPage() {
    return this.pageType === 'search';
  }

  isSupportedPage() {
    return this.pageType === 'company' || this.pageType === 'search';
  }

  detectPageInfo() {
    // Detect pagination info using exact LinkedIn classes
    const paginationText = document.querySelector('.artdeco-pagination__state--a11y');
    if (paginationText) {
      const match = paginationText.textContent.match(/Page (\d+) of (\d+)/);
      if (match) {
        this.currentPage = parseInt(match[1]);
        this.totalPages = parseInt(match[2]);
      }
    }

    // For search results, also check for page buttons
    if (this.pageType === 'search') {
      const activePageBtn = document.querySelector('.artdeco-pagination__indicator--number.active button');
      if (activePageBtn) {
        this.currentPage = parseInt(activePageBtn.textContent.trim()) || 1;
      }
      // Count total pages from pagination buttons
      const pageButtons = document.querySelectorAll('.artdeco-pagination__indicator--number button');
      if (pageButtons.length > 0) {
        const lastPageBtn = pageButtons[pageButtons.length - 1];
        this.totalPages = parseInt(lastPageBtn.textContent.trim()) || 1;
      }
    }

    // Detect total members using exact class (company page)
    if (this.pageType === 'company') {
      const memberCountElement = document.querySelector('.ESvxpuvWpGBXimYKniUQkfejUaVVbshwSSY');
      if (memberCountElement) {
        const match = memberCountElement.textContent.match(/(\d+) associated members/);
        if (match) {
          this.totalMembers = parseInt(match[1]);
        }
      }
    }

    // For search, detect results count
    if (this.pageType === 'search') {
      const resultsCount = document.querySelector('.search-results-container h2');
      if (resultsCount) {
        const match = resultsCount.textContent.match(/(\d+[\d,]*)/);
        if (match) {
          this.totalMembers = parseInt(match[1].replace(/,/g, ''));
        }
      }
    }
  }



  async startAutomation() {
    if (this.isRunning) return;

    this.isRunning = true;
    // Clear processed set for fresh page
    this.processed.clear();
    // Re-detect page info (pagination may have loaded since init)
    this.detectPageInfo();

    // If totalPages is still 1 on a search page, retry after a delay
    // (pagination DOM may not have rendered yet)
    if (this.pageType === 'search' && this.totalPages <= 1) {
      console.log('⏳ LICON: Pagination not detected yet, waiting for DOM...');
      await this.sleep(3000);
      this.detectPageInfo();
    }

    console.log('🔥 LICON: Starting automation...');
    console.log(`📊 LICON: Page ${this.currentPage}/${this.totalPages}`);

    // Report page info to background for side panel display
    this.sendMessage({
      type: 'PAGE_INFO_UPDATE',
      data: { currentPage: this.currentPage, totalPages: this.totalPages }
    });

    // Check page limit
    const pageLimit = this.settings.pageLimit || 0;
    if (pageLimit > 0 && this.pagesProcessed >= pageLimit) {
      console.log(`🛑 LICON: Page limit reached (${this.pagesProcessed}/${pageLimit})`);
      await this.sendMessage({ type: 'STOP_AUTOMATION' });
      this.stopAutomation();
      return;
    }

    try {
      if (this.pageType === 'company') {
        // Company pages: process visible profiles first, then load more (batch approach)
        await this.processCompanyPageInBatches();
      } else {
        // Search pages: all results are visible on page, just scroll to load lazy content
        await this.scrollAndLoadAll();

        // Re-detect page info after scroll (pagination may have updated)
        this.detectPageInfo();

        // Report updated page info
        this.sendMessage({
          type: 'PAGE_INFO_UPDATE',
          data: { currentPage: this.currentPage, totalPages: this.totalPages }
        });

        // Process all visible profiles
        await this.processAllProfiles();
      }

      // Increment pages processed counter and notify background
      this.pagesProcessed++;
      this.updateStats({ pageCompleted: true });

      // Handle pagination (next page button)
      await this.handlePagination();

    } catch (error) {
      console.error('LICON automation error:', error);
      this.updateStats({ error: true });
    }

    this.stopAutomation();
  }

  stopAutomation() {
    this.isRunning = false;
    console.log('🔥 LICON: Automation stopped');
  }

  async processCompanyPageInBatches() {
    console.log('👥 LICON: Processing company page in batches (visible-first)...');

    const profileLimit = this.settings.profileLimit || 0;
    let batchNumber = 0;

    while (this.isRunning) {
      batchNumber++;

      // Collect currently visible unprocessed profiles
      const profiles = this.collectCompanyProfiles();

      if (profiles.length === 0) {
        // No unprocessed profiles visible — try loading more
        const loaded = await this.loadMoreCompanyProfiles();
        if (!loaded) {
          console.log('✅ LICON: All profiles on this page processed');
          break;
        }
        continue; // Re-collect after loading more
      }

      console.log(`📦 LICON: Batch ${batchNumber} — ${profiles.length} unprocessed profiles`);

      for (let i = 0; i < profiles.length && this.isRunning; i++) {
        const profile = profiles[i];

        // Check profile limit (across all pages)
        if (profileLimit > 0 && this.totalProfilesProcessed >= profileLimit) {
          console.log(`🛑 LICON: Profile limit reached (${this.totalProfilesProcessed}/${profileLimit})`);
          await this.sendMessage({ type: 'STOP_AUTOMATION' });
          this.isRunning = false;
          break;
        }

        try {
          await this.processProfile(profile);
          this.totalProfilesProcessed++;

          // Delay between profiles (skip after last in batch — loading more provides natural delay)
          if (i < profiles.length - 1) {
            const minDelay = this.settings.minDelay || 2000;
            const maxDelay = this.settings.maxDelay || 8000;
            const delay = this.randomDelay(minDelay, maxDelay);
            console.log(`⏱️ LICON: Waiting ${delay}ms before next profile...`);
            await this.sleep(delay);
          }
        } catch (error) {
          console.error(`❌ LICON: Error processing ${profile.name}:`, error);
          this.updateStats({ error: true });
        }
      }
    }

    console.log(`📊 LICON: Company page batch processing complete — ${this.totalProfilesProcessed} total profiles processed`);
  }

  async loadMoreCompanyProfiles() {
    // Try clicking "Show more results" button
    const showMoreBtn = document.querySelector('.scaffold-finite-scroll__load-button');

    if (showMoreBtn && showMoreBtn.offsetParent !== null && !showMoreBtn.disabled) {
      console.log('📜 LICON: Clicking "Show more results"...');
      showMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.sleep(1000);
      showMoreBtn.click();
      await this.sleep(this.randomDelay(3000, 5000));
      return true;
    }

    // Try scrolling down in case lazy loading triggers new content
    const heightBefore = document.body.scrollHeight;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    await this.sleep(this.randomDelay(2000, 3000));

    // Check if scrolling loaded new content
    if (document.body.scrollHeight > heightBefore) {
      return true;
    }

    // Check one more time for Show more button (may have appeared after scroll)
    const showMoreAfterScroll = document.querySelector('.scaffold-finite-scroll__load-button');
    if (showMoreAfterScroll && showMoreAfterScroll.offsetParent !== null && !showMoreAfterScroll.disabled) {
      console.log('📜 LICON: "Show more results" appeared after scroll, clicking...');
      showMoreAfterScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.sleep(1000);
      showMoreAfterScroll.click();
      await this.sleep(this.randomDelay(3000, 5000));
      return true;
    }

    return false;
  }

  async scrollAndLoadAll() {
    console.log('📜 LICON: Loading all profiles...');
    
    let lastHeight = 0;
    let stableCount = 0;
    
    while (this.isRunning && stableCount < 3) {
      // Scroll to bottom
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      
      // Wait for content to load
      await this.sleep(this.randomDelay(2000, 4000));
      
      // Check for "Show more results" button using exact LinkedIn selector
      const showMoreBtn = document.querySelector('.scaffold-finite-scroll__load-button');
      
      if (showMoreBtn && showMoreBtn.offsetParent !== null && !showMoreBtn.disabled) {
        showMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.sleep(1000);
        showMoreBtn.click();
        await this.sleep(this.randomDelay(3000, 5000));
        stableCount = 0; // Reset counter
      } else {
        // Check if page height changed
        const currentHeight = document.body.scrollHeight;
        if (currentHeight === lastHeight) {
          stableCount++;
        } else {
          stableCount = 0;
        }
        lastHeight = currentHeight;
      }
    }
    
    console.log('📜 LICON: All profiles loaded');
  }

  async processAllProfiles() {
    console.log('👥 LICON: Processing profiles...');
    
    const profiles = this.collectProfiles();
    console.log(`🔍 LICON: Found ${profiles.length} profiles to process`);
    
    if (profiles.length === 0) {
      console.log('⚠️ LICON: No profiles found to process. Checking page structure...');
      this.debugPageStructure();
      return;
    }
    
    let processedCount = 0;
    
    const profileLimit = this.settings.profileLimit || 0;

    for (let i = 0; i < profiles.length && this.isRunning; i++) {
      const profile = profiles[i];

      // Check profile limit (across all pages)
      if (profileLimit > 0 && this.totalProfilesProcessed >= profileLimit) {
        console.log(`🛑 LICON: Profile limit reached (${this.totalProfilesProcessed}/${profileLimit})`);
        await this.sendMessage({ type: 'STOP_AUTOMATION' });
        this.isRunning = false;
        break;
      }

      console.log(`🔄 LICON: Starting to process profile ${i + 1}/${profiles.length}: ${profile.name}`);

      try {
        await this.processProfile(profile);
        processedCount++;
        this.totalProfilesProcessed++;

        // Add delay between profiles to avoid rate limiting
        if (i < profiles.length - 1) { // Don't delay after last profile
          const minDelay = this.settings.minDelay || 2000;
          const maxDelay = this.settings.maxDelay || 8000;
          const delay = this.randomDelay(minDelay, maxDelay);
          console.log(`⏱️ LICON: Waiting ${delay}ms before next profile...`);
          await this.sleep(delay);
        }

      } catch (error) {
        console.error(`❌ LICON: Error processing ${profile.name}:`, error);
        this.updateStats({ error: true });
      }
    }
    
    if (!this.isRunning) {
      console.log('🛑 LICON: Automation stopped by user');
    } else {
      console.log(`✅ LICON: Finished processing all profiles on this page`);
      console.log(`📊 LICON: Summary - Processed: ${processedCount}`);
    }
  }

  collectProfiles() {
    console.log('🔍 LICON: Collecting profiles from page (type:', this.pageType, ')...');

    if (this.pageType === 'company') {
      return this.collectCompanyProfiles();
    } else if (this.pageType === 'search') {
      return this.collectSearchProfiles();
    }

    console.log('⚠️ LICON: Unknown page type, cannot collect profiles');
    return [];
  }

  collectCompanyProfiles() {
    console.log('🔍 LICON: Collecting COMPANY page profiles...');

    const profiles = [];

    // Selectors for company people page - prioritize li selector
    const possibleSelectors = [
      'li[class*="org-people-profile-card"]',
      '.org-people-profile-card__card-spacing',
      '.org-people-profile-card',
      '[data-test-id*="people-card"]'
    ];

    let profileCards = [];
    let usedSelector = '';

    for (const selector of possibleSelectors) {
      profileCards = document.querySelectorAll(selector);
      console.log(`🔍 LICON: Trying selector "${selector}" - found ${profileCards.length} elements`);
      if (profileCards.length > 0) {
        usedSelector = selector;
        break;
      }
    }

    if (profileCards.length === 0) {
      console.log('⚠️ LICON: No profile cards found');
      this.debugPageStructure();
      return profiles;
    }

    console.log(`📋 LICON: Using selector "${usedSelector}" - processing ${profileCards.length} profile cards...`);

    Array.from(profileCards).forEach((card, index) => {
      try {
        // Use aria-label to find the profile link (most reliable)
        const nameElement = card.querySelector('a[aria-label*="View"][aria-label*="profile"]') ||
                           card.querySelector('a[href*="/in/"]');

        // Find button with aria-label for accurate detection
        const buttonElement = card.querySelector('button[aria-label*="Invite"]') ||
                             card.querySelector('button[aria-label*="Message"]') ||
                             card.querySelector('button[aria-label*="Follow"]') ||
                             card.querySelector('button[aria-label*="Connect"]') ||
                             card.querySelector('button');

        if (!nameElement) return;

        const name = nameElement.textContent.trim();
        const profileUrl = nameElement.href?.split('?')[0];

        if (!name || !profileUrl || name.length < 2 || this.processed.has(profileUrl)) return;

        // Get button text from aria-label for accuracy
        let buttonText = 'Unknown';
        if (buttonElement) {
          const ariaLabel = buttonElement.getAttribute('aria-label') || '';
          if (ariaLabel.includes('Invite') && ariaLabel.includes('connect')) {
            buttonText = 'Connect';
          } else if (ariaLabel.includes('Message')) {
            buttonText = 'Message';
          } else if (ariaLabel.includes('Follow')) {
            buttonText = 'Follow';
          } else if (ariaLabel.includes('Pending')) {
            buttonText = 'Pending';
          } else {
            buttonText = buttonElement.textContent.trim();
          }
        }

        const degreeElement = card.querySelector('.artdeco-entity-lockup__degree') ||
                             card.querySelector('[class*="degree"]');
        const degree = degreeElement ? degreeElement.textContent.trim() : 'Unknown';

        profiles.push({
          index: index + 1,
          name,
          profileUrl,
          buttonText,
          degree,
          element: card,
          buttonElement
        });

      } catch (error) {
        console.error(`❌ LICON: Error processing company profile card ${index + 1}:`, error);
      }
    });

    if (profiles.length === 0) this.debugPageStructure();
    return profiles;
  }

  collectSearchProfiles() {
    console.log('🔍 LICON: Collecting SEARCH results profiles...');

    const profiles = [];

    // Selectors for search results page
    const possibleSelectors = [
      '[data-chameleon-result-urn]',
      '[data-view-name="search-entity-result-universal-template"]',
      'li.reusable-search__result-container',
      '.entity-result'
    ];

    let profileCards = [];
    let usedSelector = '';

    for (const selector of possibleSelectors) {
      profileCards = document.querySelectorAll(selector);
      console.log(`🔍 LICON: Trying selector "${selector}" - found ${profileCards.length} elements`);
      if (profileCards.length > 0) {
        usedSelector = selector;
        break;
      }
    }

    if (profileCards.length === 0) {
      console.log('⚠️ LICON: No search result cards found');
      this.debugPageStructure();
      return profiles;
    }

    console.log(`📋 LICON: Using selector "${usedSelector}" - processing ${profileCards.length} search results...`);

    Array.from(profileCards).forEach((card, index) => {
      try {
        // Find name span first - it's inside a link with aria-hidden="true"
        const nameSpan = card.querySelector('a[href*="/in/"] span[aria-hidden="true"]') ||
                        card.querySelector('.entity-result__title-text span[aria-hidden="true"]');

        if (!nameSpan) {
          console.log(`⚠️ LICON: No name element found for card ${index + 1}`);
          return;
        }

        // Get name and find the parent link for URL
        const name = nameSpan.textContent.trim();
        const nameLink = nameSpan.closest('a[href*="/in/"]');
        const profileUrl = nameLink?.href?.split('?')[0]; // Remove query params

        if (!name || !profileUrl || this.processed.has(profileUrl)) return;

        // Find button - Connect, Message, Follow, or Pending
        const buttonElement = card.querySelector('button[aria-label*="Invite"][aria-label*="connect"]') ||
                             card.querySelector('button[aria-label*="Follow"]') ||
                             card.querySelector('button[aria-label*="Message"]') ||
                             card.querySelector('button[aria-label*="Pending"]');

        // Get button text from aria-label or inner text
        let buttonText = 'Unknown';
        if (buttonElement) {
          const ariaLabel = buttonElement.getAttribute('aria-label') || '';
          if (ariaLabel.includes('Invite') && ariaLabel.includes('connect')) {
            buttonText = 'Connect';
          } else if (ariaLabel.includes('Follow')) {
            buttonText = 'Follow';
          } else if (ariaLabel.includes('Message')) {
            buttonText = 'Message';
          } else if (ariaLabel.includes('Pending')) {
            buttonText = 'Pending';
          } else {
            const btnTextSpan = buttonElement.querySelector('.artdeco-button__text');
            buttonText = btnTextSpan ? btnTextSpan.textContent.trim() : buttonElement.textContent.trim();
          }
        }

        // Get connection degree from badge
        const degreeElement = card.querySelector('.entity-result__badge-text span[aria-hidden="true"]') ||
                             card.querySelector('.entity-result__badge-text');
        let degree = 'Unknown';
        if (degreeElement) {
          const degreeMatch = degreeElement.textContent.match(/(\d+)(?:st|nd|rd|th)/);
          degree = degreeMatch ? degreeMatch[0] : degreeElement.textContent.trim();
        }

        profiles.push({
          index: index + 1,
          name,
          profileUrl,
          buttonText,
          degree,
          element: card,
          buttonElement
        });

      } catch (error) {
        console.error(`❌ LICON: Error processing search result card ${index + 1}:`, error);
      }
    });

    if (profiles.length === 0) this.debugPageStructure();
    return profiles;
  }

  async processProfile(profile) {
    console.log(`🔄 LICON: Starting to process ${profile.name} (Button: "${profile.buttonText}") [${profile.degree}]`);
    
    // Mark as processed immediately to avoid duplicates
    this.processed.add(profile.profileUrl);
    this.updateStats({ processed: true });
    
    try {
      // Scroll profile into view first
      profile.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.sleep(this.randomDelay(500, 1000));
      
      // Process based on button type
      const btn = profile.buttonText.toLowerCase();

      if (btn.includes('connect')) {
        console.log(`🔗 LICON: Direct connect available for ${profile.name}`);
        await this.handleDirectConnect(profile);

      } else if (btn.includes('message')) {
        // Message button: check degree to determine if actually connected
        // On company pages, 2nd/3rd degree profiles often show Message (InMail/Open Profile)
        const isFirstDegree = profile.degree && profile.degree.includes('1st');
        if (isFirstDegree) {
          console.log(`💬 LICON: Skipping ${profile.name} - Message + 1st degree = already connected`);
          this.updateStats({ skipped: true, skipReason: 'alreadyConnected' });
        } else {
          console.log(`💬 LICON: ${profile.name} has Message button but is ${profile.degree} - opening profile for More → Connect`);
          await this.handleFollowProfile(profile);
        }

      } else if (btn.includes('follow') && !btn.includes('following')) {
        console.log(`👥 LICON: Follow button detected for ${profile.name} - will open profile for More → Connect`);
        await this.handleFollowProfile(profile);

      } else if (btn.includes('pending')) {
        console.log(`⏳ LICON: Skipping ${profile.name} - Connection already pending`);
        this.updateStats({ skipped: true, skipReason: 'pending' });

      } else if (btn.includes('following')) {
        console.log(`✅ LICON: Skipping ${profile.name} - Already following`);
        this.updateStats({ skipped: true, skipReason: 'alreadyConnected' });

      } else if (btn === 'unknown' && !profile.buttonElement) {
        console.log(`⚠️ LICON: Skipping ${profile.name} - No action button found`);
        this.updateStats({ skipped: true, skipReason: 'noConnectButton' });

      } else {
        console.log(`❓ LICON: Unknown button type for ${profile.name}: "${profile.buttonText}" - attempting to click anyway`);

        try {
          profile.buttonElement.click();
          await this.sleep(this.randomDelay(1500, 2500));

          const modal = document.querySelector('[data-test-modal-id="send-invite-modal"]') ||
                        document.querySelector('.send-invite') ||
                        document.querySelector('.artdeco-modal-overlay--is-top-layer');

          if (modal) {
            console.log(`🔗 LICON: Connect modal appeared for ${profile.name} - processing...`);
            const success = await this.handleConnectionModal(profile.name, profile);
            if (!success) {
              this.updateStats({ error: true });
            }
          } else {
            console.log(`❓ LICON: No modal appeared for ${profile.name} - button might not be connect`);
            this.updateStats({ skipped: true, skipReason: 'noConnectButton' });
            this.addFailedProfile(profile, 'noConnectButton', 'No connect modal appeared after clicking button');
          }
        } catch (error) {
          console.error(`❌ LICON: Error clicking unknown button for ${profile.name}:`, error);
          this.updateStats({ error: true });
          this.addFailedProfile(profile, 'error', error.message);
        }
      }
      
    } catch (error) {
      console.error(`❌ LICON: Error processing ${profile.name}:`, error);
      this.updateStats({ error: true });
    }
    
    console.log(`✅ LICON: Completed processing ${profile.name}`);
  }

  async handleDirectConnect(profile) {
    profile.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.sleep(this.randomDelay(800, 1500));

    profile.buttonElement.click();
    this.updateStats({ attempted: true });

    await this.sleep(this.randomDelay(1500, 2500));
    const success = await this.handleConnectionModal(profile.name, profile);

    if (!success) {
      this.updateStats({ error: true });
      this.addFailedProfile(profile, 'connectFailed', 'Direct connect button clicked but connection not sent');
    }
  }

  async handleFollowProfile(profile) {
    console.log(`🔗 LICON: ${profile.name} (${profile.buttonText}) - opening profile for More → Connect...`);
    await this.openProfileForConnect(profile);
  }

  async openProfileForConnect(profile) {
    // Send message to background to open profile in new tab and inject connector
    await this.sendMessage({
      type: 'CONNECTION_ATTEMPT',
      data: {
        needsProfileVisit: true,
        profileUrl: profile.profileUrl,
        name: profile.name
      }
    });

    this.updateStats({ attempted: true });
  }

  async handleConnectionModal(profileName, profile = null) {
    const modal = document.querySelector('[data-test-modal-id="send-invite-modal"]') ||
                  document.querySelector('.send-invite') ||
                  document.querySelector('.artdeco-modal-overlay--is-top-layer');

    if (!modal) {
      console.log(`No modal found for ${profileName}`);
      return false;
    }

    const modalText = modal.textContent || '';

    // Check for "How do you know" / email required modal
    if (modalText.includes('How do you know') || modalText.includes('email address')) {
      console.log(`⚠️ LICON: Email required to connect with ${profileName}`);
      const closeBtn = modal.querySelector('[data-test-modal-close-btn]') ||
                       modal.querySelector('.artdeco-modal__dismiss');
      if (closeBtn) closeBtn.click();
      if (profile) {
        this.addFailedProfile(profile, 'emailRequired', 'LinkedIn requires email to connect');
      }
      return false;
    }

    // Check for weekly invitation limit
    if (modalText.includes('invitation limit') || modalText.includes('weekly limit')) {
      console.log(`🛑 LICON: Weekly invitation limit reached`);
      const closeBtn = modal.querySelector('[data-test-modal-close-btn]') ||
                       modal.querySelector('.artdeco-modal__dismiss');
      if (closeBtn) closeBtn.click();
      if (profile) {
        this.addFailedProfile(profile, 'weeklyLimit', 'Weekly invitation limit reached');
      }
      // Stop automation entirely - no point continuing
      await this.sendMessage({ type: 'STOP_AUTOMATION' });
      this.isRunning = false;
      return false;
    }

    // Look for send button - try multiple patterns
    const sendBtn = modal.querySelector('button[aria-label*="Send without a note"]') ||
                    modal.querySelector('button[aria-label*="Send now"]') ||
                    [...modal.querySelectorAll('button.artdeco-button--primary')].find(btn =>
                      btn.textContent.includes('Send')
                    );

    if (sendBtn) {
      sendBtn.click();
      console.log(`✅ Connection sent to ${profileName}`);
      this.updateStats({ successful: true });
      await this.sleep(1000);
      return true;
    } else {
      const closeBtn = modal.querySelector('[data-test-modal-close-btn]') ||
                       modal.querySelector('.artdeco-modal__dismiss');
      if (closeBtn) closeBtn.click();
      console.log(`❌ Could not send connection to ${profileName}`);
      if (profile) {
        this.addFailedProfile(profile, 'modalSendFailed', 'Could not find send button in modal');
      }
      return false;
    }
  }

  async handlePagination() {
    if (!this.isRunning) return;

    // Check if there's a next page using LinkedIn selectors
    let nextBtn = null;

    if (this.pageType === 'company') {
      nextBtn = document.querySelector('.artdeco-pagination__button--next:not([disabled])');
    } else if (this.pageType === 'search') {
      // Search results use different pagination
      nextBtn = document.querySelector('button[aria-label="Next"]:not([disabled])') ||
                document.querySelector('.artdeco-pagination__button--next:not([disabled])');
    }

    // Check page limit before navigating
    const pageLimitCheck = this.settings.pageLimit || 0;
    if (pageLimitCheck > 0 && this.pagesProcessed >= pageLimitCheck) {
      console.log(`🛑 LICON: Page limit reached (${this.pagesProcessed}/${pageLimitCheck})`);
      await this.sendMessage({ type: 'STOP_AUTOMATION' });
      this.stopAutomation();
      return;
    }

    // Navigate if next button exists AND (we haven't reached totalPages OR totalPages detection failed)
    if (nextBtn && (this.currentPage < this.totalPages || this.totalPages <= 1)) {
      console.log(`📄 LICON: Moving to page ${this.currentPage + 1}/${this.totalPages}`);

      // For search pages, clicking next causes a full page navigation
      // The new content script will auto-detect running state and continue
      if (this.pageType === 'search') {
        console.log('🔄 LICON: Navigating to next search page...');
        nextBtn.click();
        // Don't do anything else - new page will load fresh content script
        // which will check background status and auto-continue
        return;
      }

      // For company pages, it might be AJAX-based
      nextBtn.click();
      await this.sleep(5000);

      // Re-detect page type and info
      this.pageType = this.detectPageType();
      this.detectPageInfo();

      // Clear processed set for new page
      this.processed.clear();

      // Reset isRunning so startAutomation can re-enter
      this.isRunning = false;
      await this.startAutomation();
    } else {
      console.log('🎉 LICON: All pages completed!');
      // Tell background to stop
      await this.sendMessage({ type: 'STOP_AUTOMATION' });
      this.stopAutomation();
    }
  }

  updateStats(data) {
    // Send to background for global tracking (side panel will display stats)
    this.sendMessage({ type: 'PROFILE_PROCESSED', data });
  }

  addFailedProfile(profile, reason, details) {
    // Send failed profile to background for tracking
    this.sendMessage({
      type: 'ADD_FAILED_PROFILE',
      data: {
        name: profile.name,
        profileUrl: profile.profileUrl,
        buttonText: profile.buttonText,
        degree: profile.degree,
        reason: reason,
        details: details
      }
    });
    console.log(`📋 LICON: Added ${profile.name} to failed profiles queue (${reason})`);
  }

  async sendMessage(message) {
    return new Promise((resolve) => {
      if (!chrome.runtime?.id) {
        console.error('❌ LICON: Extension context invalidated, cannot send message');
        this.isRunning = false;
        resolve(null);
        return;
      }
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ LICON: Message error:', chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        resolve(response);
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  debugPageStructure() {
    console.log('🔍 LICON: Debugging page structure...');
    
    // Check for different possible profile containers
    const possibleContainers = [
      '.org-people-profile-card__card-spacing',
      '.artdeco-card',
      'section[class*="artdeco-card"]',
      'li[class*="profile"]',
      '[class*="people-profile"]'
    ];
    
    possibleContainers.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`🔍 LICON: "${selector}" found ${elements.length} elements`);
      
      if (elements.length > 0) {
        console.log(`📋 LICON: First element classes:`, elements[0].className);
        
        // Check for buttons in first element
        const buttons = elements[0].querySelectorAll('button');
        console.log(`🔘 LICON: Found ${buttons.length} buttons in first element`);
        buttons.forEach((btn, i) => {
          console.log(`   Button ${i}: "${btn.textContent.trim()}" (${btn.className})`);
        });
        
        // Check for links in first element
        const links = elements[0].querySelectorAll('a[href*="/in/"]');
        console.log(`🔗 LICON: Found ${links.length} profile links in first element`);
        links.forEach((link, i) => {
          console.log(`   Link ${i}: "${link.textContent.trim()}" → ${link.href}`);
        });
      }
    });
    
    // Check current URL
    console.log(`🌐 LICON: Current URL: ${window.location.href}`);
    
    // Check if we're on the right page
    const isCompanyPage = window.location.href.match(/linkedin\.com\/company\/[^\/]+\/people/);
    console.log(`✅ LICON: Is company people page: ${!!isCompanyPage}`);
  }
}

// Initialize when DOM is ready with proper error handling
console.log('🔥 LICON: Content script loaded on:', window.location.href);

function initializeLicon() {
  try {
    console.log('🚀 LICON: Initializing main automator...');
    console.log('🔍 LICON: Document ready state:', document.readyState);
    console.log('🔍 LICON: Chrome runtime available:', typeof chrome !== 'undefined' && !!chrome.runtime);
    
    // Check if we have Chrome extension context
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      console.error('❌ LICON: Chrome extension context not available');
      return;
    }
    
    // Check if we're on a supported page
    const isCompanyPeoplePage = window.location.href.match(/linkedin\.com\/company\/[^\/]+\/people/);
    const isSearchPeoplePage = window.location.href.match(/linkedin\.com\/search\/results\/people/);
    const isSupportedPage = isCompanyPeoplePage || isSearchPeoplePage;

    console.log('🔍 LICON: Is company people page:', !!isCompanyPeoplePage);
    console.log('🔍 LICON: Is search people page:', !!isSearchPeoplePage);

    if (!isSupportedPage) {
      console.log('ℹ️ LICON: Not on a supported LinkedIn page, skipping initialization');
      return;
    }
    
    // Initialize the automator
    console.log('🔧 LICON: Creating LiconMainAutomator instance...');
    window.liconAutomator = new LiconMainAutomator();
    console.log('✅ LICON: Main automator initialized successfully');
    
  } catch (error) {
    console.error('❌ LICON: Failed to initialize:', error);
    console.error('❌ LICON: Error stack:', error.stack);
  }
}

// Test message listener immediately
console.log('🧪 LICON: Setting up test message listener...');
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('🧪 LICON: TEST - Received message in content script:', message);
    console.log('🧪 LICON: TEST - Message type:', message.type);
    console.log('🧪 LICON: TEST - Sender:', sender);
    
    if (message.type === 'PING') {
      console.log('🧪 LICON: TEST - PING received, responding');
      sendResponse({ testListener: true, timestamp: Date.now() });
      return true;
    }
    
    if (message.type === 'AUTOMATION_STARTED') {
      console.log('🧪 LICON: TEST - AUTOMATION_STARTED message received!');
    }
    
    sendResponse({ received: true, timestamp: Date.now() });
    return true;
  });
  console.log('✅ LICON: Test message listener set up');
} else {
  console.error('❌ LICON: Cannot set up test message listener - Chrome runtime not available');
}

// Initialize based on document state
console.log('🔍 LICON: Current document state:', document.readyState);
if (document.readyState === 'loading') {
  console.log('📄 LICON: Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 LICON: DOMContentLoaded event fired');
    initializeLicon();
  });
} else {
  console.log('📄 LICON: Document already loaded, initializing immediately');
  initializeLicon();
}

})(); // end IIFE guard