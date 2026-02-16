// LICON Profile Connector - Handles individual profile connections with exact LinkedIn selectors
class LiconProfileConnector {
  constructor() {
    this.init();
  }

  async init() {
    // Wait for page to fully load
    await this.waitForPageLoad();
    
    // Check if this is a LinkedIn profile page
    if (!this.isProfilePage()) {
      console.log('Not a LinkedIn profile page, closing tab...');
      this.notifyFailure('notProfilePage', 'Tab URL did not match a LinkedIn profile page: ' + window.location.href);
      this.closeTab();
      return;
    }

    // Attempt to connect
    await this.attemptConnection();
    
    // Close tab after processing
    setTimeout(() => this.closeTab(), 3000);
  }

  isProfilePage() {
    return window.location.href.match(/linkedin\.com\/in\/[^\/]+\/?(\?|$)/);
  }

  async waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        setTimeout(resolve, 3000); // Extra wait for dynamic content (background tabs load slower)
      } else {
        window.addEventListener('load', () => {
          setTimeout(resolve, 3000);
        });
      }
    });
  }

  async attemptConnection() {
    try {
      // First, check if there's a direct Connect button using exact LinkedIn selectors
      const directConnectBtn = this.findDirectConnectButton();
      if (directConnectBtn) {
        console.log('Found direct Connect button');
        await this.clickConnectButton(directConnectBtn);
        return;
      }

      // If no direct connect, look for "More" button using exact LinkedIn selectors
      const moreButton = this.findMoreButton();
      if (!moreButton) {
        console.log('No More button found, cannot connect');
        this.notifyFailure('noMoreButton', 'No More button found on profile');
        return;
      }

      // Click More button and wait for dropdown animation
      console.log('Clicking More button...');
      moreButton.click();
      await this.sleep(1500);

      // Look for Connect option in dropdown using exact LinkedIn selectors
      const connectOption = this.findConnectInDropdown();
      if (!connectOption) {
        // Check if already following (explains missing Connect option)
        const dropdownItems = document.querySelectorAll('.artdeco-dropdown__item');
        const hasUnfollow = [...dropdownItems].some(i => i.textContent.includes('Unfollow') && i.offsetParent !== null);
        if (hasUnfollow) {
          console.log('Already following this profile — Connect not available in dropdown');
          this.notifyFailure('alreadyFollowing', 'Already following — Connect option not available');
        } else {
          console.log('No Connect option in dropdown');
          this.notifyFailure('noConnectInDropdown', 'No Connect option in dropdown menu');
        }
        // Close dropdown before leaving
        const closeBtn = document.querySelector('.artdeco-dropdown__trigger--is-open');
        if (closeBtn) closeBtn.click();
        return;
      }

      // Click Connect option
      console.log('Clicking Connect option...');
      connectOption.click();
      await this.sleep(1500);

      // Handle connection modal
      await this.handleConnectionModal();

    } catch (error) {
      console.error('Error in profile connection:', error);
      this.notifyFailure('error', error.message);
    }
  }

  findDirectConnectButton() {
    // IMPORTANT: We must verify any Connect button is for the PROFILE OWNER,
    // not sidebar "People also viewed" recommendations (which are inside scaffold-layout__main)
    const mainArea = document.querySelector('.scaffold-layout__main') || document;
    const profileFirstName = document.querySelector('h1')?.textContent?.trim()?.split(' ')[0];

    // First: look for button with "Invite [name] connect" aria-label matching the profile owner
    const allInviteButtons = mainArea.querySelectorAll('button[aria-label*="Invite"][aria-label*="connect"]');
    for (const btn of allInviteButtons) {
      if (btn.offsetParent === null) continue; // not visible
      const label = btn.getAttribute('aria-label') || '';
      // If we know the profile name, only accept buttons for this person
      if (profileFirstName && !label.includes(profileFirstName)) {
        console.log('Skipping sidebar Connect button:', label);
        continue;
      }
      return btn;
    }

    // Fallback: look for Connect button in the profile's top card only (not sidebar)
    const h1 = document.querySelector('h1');
    const topCard = h1?.closest('.artdeco-card') || h1?.closest('section');
    if (topCard) {
      const cardButtons = topCard.querySelectorAll('button.artdeco-button');
      for (const btn of cardButtons) {
        if (btn.textContent.trim() === 'Connect' && btn.offsetParent !== null) {
          return btn;
        }
      }
    }

    return null;
  }

  findMoreButton() {
    // Scope to the profile's top card to avoid sidebar elements
    const h1 = document.querySelector('h1');
    const topCard = h1?.closest('.artdeco-card') || h1?.closest('section');
    // Also check sticky header actions (visible when scrolled down)
    const stickyActions = document.querySelector('.pvs-sticky-header-profile-actions');
    const fallback = document.querySelector('.scaffold-layout__main') || document;

    const candidates = [
      ...(topCard ? topCard.querySelectorAll('button[aria-label*="More actions"]') : []),
      ...(stickyActions ? stickyActions.querySelectorAll('button[aria-label*="More actions"]') : []),
      ...fallback.querySelectorAll('button[aria-label*="More actions"]')
    ].filter(btn =>
      (btn.textContent.trim() === 'More' ||
       btn.querySelector('svg[data-test-icon*="overflow"]')) &&
      btn.offsetParent !== null // visible
    );

    // Deduplicate (same button may appear from multiple queries)
    const seen = new Set();
    const unique = candidates.filter(btn => {
      if (seen.has(btn)) return false;
      seen.add(btn);
      return true;
    });

    return unique[0] || null;
  }

  findConnectInDropdown() {
    // Look for Connect option in the dropdown menu using exact LinkedIn selectors
    const dropdownItems = [
      // Connect option in dropdown (from message_button_profile.html)
      ...document.querySelectorAll('div[aria-label*="Invite"][aria-label*="connect"].artdeco-dropdown__item'),
      // Alternative dropdown item patterns
      ...document.querySelectorAll('.artdeco-dropdown__item')
    ].filter(item => 
      item.textContent.includes('Connect') &&
      item.offsetParent !== null && // visible
      !item.textContent.includes('LinkedIn') // exclude "Send profile in a message"
    );

    return dropdownItems[0] || null;
  }

  async clickConnectButton(button) {
    // Scroll button into view
    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await this.sleep(500);

    // Click the button
    button.click();
    await this.sleep(1500);

    // Handle modal
    await this.handleConnectionModal();
  }

  async handleConnectionModal() {
    await this.sleep(1000);

    const modal = document.querySelector('[data-test-modal-id="send-invite-modal"]') ||
                  document.querySelector('.send-invite') ||
                  document.querySelector('.artdeco-modal-overlay--is-top-layer') ||
                  document.querySelector('[role="dialog"]');

    if (!modal) {
      console.log('No connection modal found');
      this.notifyFailure('noModal', 'Connection modal did not appear');
      return;
    }

    const modalText = modal.textContent || '';

    // Check for email required
    if (modalText.includes('How do you know') || modalText.includes('email address')) {
      console.log('Email required to connect');
      this.notifyFailure('emailRequired', 'LinkedIn requires email to connect');
      const closeBtn = modal.querySelector('[data-test-modal-close-btn]') ||
                       modal.querySelector('.artdeco-modal__dismiss');
      if (closeBtn) closeBtn.click();
      return;
    }

    // Check for weekly limit
    if (modalText.includes('invitation limit') || modalText.includes('weekly limit')) {
      console.log('Weekly invitation limit reached');
      this.notifyFailure('weeklyLimit', 'Weekly invitation limit reached');
      const closeBtn = modal.querySelector('[data-test-modal-close-btn]') ||
                       modal.querySelector('.artdeco-modal__dismiss');
      if (closeBtn) closeBtn.click();
      return;
    }

    // Try multiple send button patterns
    const sendButton = modal.querySelector('button[aria-label*="Send without a note"]') ||
                      modal.querySelector('button[aria-label*="Send now"]') ||
                      [...modal.querySelectorAll('button.artdeco-button--primary')].find(btn =>
                        btn.textContent.includes('Send')
                      );

    if (sendButton) {
      console.log('Clicking send button...');
      sendButton.click();
      await this.sleep(1000);
      console.log('Connection invitation sent!');
      this.notifySuccess();
    } else {
      console.log('Send button not found, closing modal...');
      this.notifyFailure('modalSendFailed', 'Could not find send button in modal');
      const closeButton = modal.querySelector('[data-test-modal-close-btn]') ||
                          modal.querySelector('.artdeco-modal__dismiss');
      if (closeButton) closeButton.click();
    }
  }

  notifySuccess() {
    chrome.runtime.sendMessage({
      type: 'PROFILE_PROCESSED',
      data: { successful: true }
    });
  }

  notifyFailure(reason, details) {
    chrome.runtime.sendMessage({
      type: 'ADD_FAILED_PROFILE',
      data: {
        name: document.title.replace(' | LinkedIn', '').trim(),
        profileUrl: window.location.href.split('?')[0],
        reason,
        details,
        buttonText: 'Profile Visit',
        degree: 'Unknown'
      }
    });
    chrome.runtime.sendMessage({
      type: 'PROFILE_PROCESSED',
      data: { error: true }
    });
  }

  closeTab() {
    // Close this tab
    chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize profile connector
new LiconProfileConnector();