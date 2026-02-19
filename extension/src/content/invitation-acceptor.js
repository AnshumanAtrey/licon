// LICON Invitation Acceptor - Auto-accept connection requests from invitation manager
(function() {
if (window.__liconAcceptorLoaded) {
  if (!chrome.runtime?.id) {
    console.log('LICON Accept: Extension context invalidated, re-initializing...');
    window.__liconAcceptorLoaded = false;
  } else {
    console.log('LICON Accept: Already loaded, skipping');
    return;
  }
}
window.__liconAcceptorLoaded = true;

class LiconInvitationAcceptor {
  constructor() {
    this.isRunning = false;
    this.settings = {};
    this.stats = { processed: 0, accepted: 0, skipped: 0, errors: 0 };
    this.setupMessageListener();
    console.log('LICON Accept: Invitation acceptor initialized');
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'PING':
          sendResponse({ success: true, message: 'PONG_ACCEPTOR' });
          break;

        case 'ACCEPT_AUTOMATION_STARTED':
          if (this.isRunning) {
            sendResponse({ success: true, message: 'Already running' });
            break;
          }
          this.settings = message.data || {};
          this.stats = { processed: 0, accepted: 0, skipped: 0, errors: 0 };
          this.startAccepting();
          sendResponse({ success: true, message: 'Accept automation started' });
          break;

        case 'ACCEPT_AUTOMATION_STOPPED':
          this.isRunning = false;
          console.log('LICON Accept: Stopped by background');
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: true });
      }
    } catch (error) {
      console.error('LICON Accept: Message error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  detectInvitationType(card) {
    const text = card.textContent || '';

    if (text.includes('inviting you to connect') || text.includes('wants to connect')) {
      return 'connection';
    }
    if (text.includes('Newsletter') || text.includes('invited you to subscribe')) {
      return 'newsletter';
    }
    if (text.includes('invited you to follow')) {
      return 'follow';
    }

    // Fallback: if card has an Accept button but no clear type, treat as connection
    const acceptBtn = card.querySelector('button');
    if (acceptBtn) {
      const btnText = (acceptBtn.textContent || '').trim().toLowerCase();
      if (btnText === 'accept') return 'connection';
    }

    return 'unknown';
  }

  isTypeEnabled(type) {
    switch (type) {
      case 'connection': return this.settings.acceptConnections !== false;
      case 'newsletter': return this.settings.acceptNewsletters === true;
      case 'follow': return this.settings.acceptFollows === true;
      default: return false;
    }
  }

  findAcceptButton(card) {
    // Look for Accept button - LinkedIn uses various button patterns
    const buttons = card.querySelectorAll('button');
    for (const btn of buttons) {
      const text = (btn.textContent || '').trim().toLowerCase();
      const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (text === 'accept' || ariaLabel.includes('accept')) {
        return btn;
      }
    }
    return null;
  }

  collectInvitationCards() {
    // LinkedIn invitation manager uses a list of invitation cards
    const selectors = [
      '.invitation-card',
      'li.invitation-card__container',
      '[class*="invitation-card"]',
      '.mn-invitation-list li',
      // Newer LinkedIn layout
      'section.mn-invitation-manager__invitation-list li',
      '.artdeco-list__item',
    ];

    for (const selector of selectors) {
      const cards = document.querySelectorAll(selector);
      if (cards.length > 0) {
        console.log(`LICON Accept: Found ${cards.length} cards with "${selector}"`);
        return Array.from(cards);
      }
    }

    // Broader fallback: find list items in the main content area that contain Accept buttons
    const mainContent = document.querySelector('main') || document.body;
    const listItems = mainContent.querySelectorAll('li');
    const cardsWithAccept = Array.from(listItems).filter(li => {
      return this.findAcceptButton(li) !== null;
    });

    if (cardsWithAccept.length > 0) {
      console.log(`LICON Accept: Found ${cardsWithAccept.length} cards via Accept button fallback`);
      return cardsWithAccept;
    }

    console.log('LICON Accept: No invitation cards found');
    return [];
  }

  async startAccepting() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('LICON Accept: Starting auto-accept with settings:', this.settings);

    const limit = this.settings.acceptLimit || 0;
    let totalAccepted = 0;

    try {
      while (this.isRunning) {
        // Check extension context
        if (!chrome.runtime?.id) {
          console.log('LICON Accept: Extension context lost, stopping');
          break;
        }

        // Check limit
        if (limit > 0 && totalAccepted >= limit) {
          console.log(`LICON Accept: Limit reached (${totalAccepted}/${limit})`);
          break;
        }

        const cards = this.collectInvitationCards();
        if (cards.length === 0) {
          console.log('LICON Accept: No more invitation cards found');
          break;
        }

        let processedAny = false;

        for (const card of cards) {
          if (!this.isRunning) break;
          if (!chrome.runtime?.id) break;
          if (limit > 0 && totalAccepted >= limit) break;

          const type = this.detectInvitationType(card);
          const acceptBtn = this.findAcceptButton(card);

          if (!acceptBtn) {
            // No accept button - already processed or different UI state
            continue;
          }

          processedAny = true;
          this.stats.processed++;

          if (!this.isTypeEnabled(type)) {
            console.log(`LICON Accept: Skipping ${type} invitation (disabled)`);
            this.stats.skipped++;
            this.reportStats();
            continue;
          }

          try {
            // Scroll card into view
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await this.sleep(500);

            // Click accept
            acceptBtn.click();
            console.log(`LICON Accept: Accepted ${type} invitation`);

            this.stats.accepted++;
            totalAccepted++;
            this.reportStats();

            // Random delay between accepts
            const minDelay = this.settings.minDelay || 1000;
            const maxDelay = this.settings.maxDelay || 3000;
            const delay = this.randomDelay(minDelay, maxDelay);
            await this.sleep(delay);

          } catch (error) {
            console.error('LICON Accept: Error accepting invitation:', error);
            this.stats.errors++;
            this.reportStats();
          }
        }

        if (!processedAny) {
          // No processable cards found - try scrolling to load more
          const loaded = await this.loadMore();
          if (!loaded) {
            console.log('LICON Accept: No more invitations to load');
            break;
          }
        }
      }
    } catch (error) {
      console.error('LICON Accept: Fatal error:', error);
      this.stats.errors++;
      this.reportStats();
    }

    this.isRunning = false;
    console.log('LICON Accept: Finished. Stats:', this.stats);

    // Notify background that we're done
    this.sendMessage({ type: 'STOP_ACCEPT_AUTOMATION' });
  }

  async loadMore() {
    // Try scrolling down to trigger lazy loading
    const heightBefore = document.body.scrollHeight;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    await this.sleep(2000);

    // Check for "Show more" button
    const showMoreBtn = document.querySelector('button.scaffold-finite-scroll__load-button') ||
                        document.querySelector('[class*="show-more"]');
    if (showMoreBtn && showMoreBtn.offsetParent !== null) {
      showMoreBtn.click();
      await this.sleep(2000);
      return true;
    }

    return document.body.scrollHeight > heightBefore;
  }

  reportStats() {
    this.sendMessage({
      type: 'ACCEPT_PROCESSED',
      data: this.stats
    });
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      if (!chrome.runtime?.id) {
        resolve(null);
        return;
      }
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('LICON Accept: Message error:', chrome.runtime.lastError.message);
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
}

// Initialize
console.log('LICON Accept: Content script loaded on:', window.location.href);

function initializeAcceptor() {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('LICON Accept: Chrome extension context not available');
    return;
  }

  const isInvitationManager = window.location.href.includes('/mynetwork/invitation-manager');
  if (!isInvitationManager) {
    console.log('LICON Accept: Not on invitation manager page, skipping');
    return;
  }

  window.liconAcceptor = new LiconInvitationAcceptor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAcceptor);
} else {
  initializeAcceptor();
}

})();
