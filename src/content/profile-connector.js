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
      this.closeTab();
      return;
    }

    // Attempt to connect
    await this.attemptConnection();
    
    // Close tab after processing
    setTimeout(() => this.closeTab(), 3000);
  }

  isProfilePage() {
    return window.location.href.match(/linkedin\.com\/in\/[^\/]+\/?$/);
  }

  async waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        setTimeout(resolve, 2000); // Extra wait for dynamic content
      } else {
        window.addEventListener('load', () => {
          setTimeout(resolve, 2000);
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
        return;
      }

      // Click More button
      console.log('Clicking More button...');
      moreButton.click();
      await this.sleep(1000);

      // Look for Connect option in dropdown using exact LinkedIn selectors
      const connectOption = this.findConnectInDropdown();
      if (!connectOption) {
        console.log('No Connect option in dropdown');
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
    }
  }

  findDirectConnectButton() {
    // Look for primary Connect button using exact LinkedIn classes from reference
    const connectButtons = [
      // Primary connect button (from profile_with_connect_button.html)
      ...document.querySelectorAll('button[aria-label*="Invite"][aria-label*="connect"].artdeco-button--primary'),
      // Secondary connect button patterns
      ...document.querySelectorAll('button.artdeco-button--primary')
    ].filter(btn => 
      btn.textContent.trim() === 'Connect' && 
      btn.classList.contains('artdeco-button--primary') &&
      btn.offsetParent !== null // visible
    );

    return connectButtons[0] || null;
  }

  findMoreButton() {
    // Look for More actions button using exact LinkedIn selectors from reference
    const moreButtons = [
      // More button with overflow icon (from message_button_profile.html)
      ...document.querySelectorAll('button[aria-label*="More actions"]'),
      // More button with text
      ...document.querySelectorAll('button.artdeco-button--secondary')
    ].filter(btn => 
      (btn.textContent.trim() === 'More' ||
       btn.querySelector('svg[data-test-icon*="overflow"]')) &&
      btn.offsetParent !== null // visible
    );

    return moreButtons[0] || null;
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
    // Wait for modal to appear
    await this.sleep(1000);

    // Look for the connection invitation modal using exact LinkedIn selectors from reference
    const modal = document.querySelector('[data-test-modal-id="send-invite-modal"]') ||
                  document.querySelector('.send-invite') ||
                  document.querySelector('.artdeco-modal-overlay--is-top-layer') ||
                  document.querySelector('[role="dialog"]');

    if (!modal) {
      console.log('No connection modal found');
      return;
    }

    console.log('Connection modal found, looking for send button...');

    // Look for "Send without a note" button using exact LinkedIn selectors from reference
    const sendButton = modal.querySelector('button[aria-label*="Send without a note"]') ||
                      [...modal.querySelectorAll('button.artdeco-button--primary')].find(btn => 
                        btn.textContent.includes('Send without a note')
                      );

    if (sendButton) {
      console.log('Clicking "Send without a note"...');
      sendButton.click();
      await this.sleep(1000);
      console.log('✅ Connection invitation sent!');
      
      // Notify background script of success
      this.notifySuccess();
    } else {
      console.log('Send button not found, closing modal...');
      // Try to close modal using exact LinkedIn selectors from reference
      const closeButton = modal.querySelector('[data-test-modal-close-btn]') ||
                          modal.querySelector('button[aria-label*="Dismiss"].artdeco-modal__dismiss');
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  notifySuccess() {
    // Send success message to background script
    chrome.runtime.sendMessage({
      type: 'PROFILE_PROCESSED',
      data: { successful: true }
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