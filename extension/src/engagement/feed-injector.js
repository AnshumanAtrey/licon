// LICON Feed Injector - Injects AI Reply button into LinkedIn feed posts
(function() {
  if (window.__liconFeedInjectorLoaded) {
    if (!chrome.runtime?.id) {
      window.__liconFeedInjectorLoaded = false;
    } else {
      return;
    }
  }
  window.__liconFeedInjectorLoaded = true;

  class LiconFeedInjector {
    constructor() {
      this.injectedPosts = new WeakSet();
      this.debounceTimer = null;
      this.init();
    }

    init() {
      console.log('LICON Feed Injector: Starting on', window.location.href);
      this.injectButtons();
      this.observeFeed();
    }

    injectButtons() {
      const posts = document.querySelectorAll('[data-view-name="feed-full-update"]');
      let injected = 0;

      for (const post of posts) {
        if (this.injectedPosts.has(post)) continue;
        this.injectedPosts.add(post);

        const commentBtn = post.querySelector('[data-view-name="feed-comment-button"]');
        if (!commentBtn) continue;

        const aiBtn = this.createAIButton(post);
        const btnContainer = commentBtn.closest('.feed-shared-social-action-bar, .social-actions-button') ||
                             commentBtn.parentElement;
        if (btnContainer) {
          btnContainer.insertBefore(aiBtn, commentBtn.nextSibling);
          injected++;
        }
      }

      if (injected > 0) {
        console.log(`LICON Feed Injector: Injected ${injected} AI Reply buttons`);
      }
    }

    createAIButton(post) {
      const btn = document.createElement('button');
      btn.className = 'licon-ai-reply-btn';
      btn.setAttribute('data-licon', 'true');
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
          <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
          <path d="M18 14c2 1 3 3 3 5v2H3v-2c0-2 1-4 3-5"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
        <span>AI Reply</span>
      `;

      btn.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 12px;
        border: none;
        border-radius: 18px;
        background: transparent;
        color: rgba(0,0,0,0.6);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: background 0.15s ease;
        margin-left: 2px;
      `;

      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(0,0,0,0.08)';
      });
      btn.addEventListener('mouseleave', () => {
        if (!btn.disabled) btn.style.background = 'transparent';
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleAIReply(post, btn);
      });

      return btn;
    }

    async handleAIReply(post, btn) {
      if (btn.disabled) return;

      // Show loading state
      btn.disabled = true;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:4px;"><span class="licon-spinner"></span> Thinking...</span>';
      btn.style.background = 'rgba(0,0,0,0.05)';
      this.ensureSpinnerCSS();

      try {
        // Extract post content
        const postTextEl = post.querySelector('[data-view-name="feed-commentary"]');
        const postText = postTextEl?.textContent?.trim() || '';

        if (!postText) {
          this.showInlineMessage(btn, 'No post text found', originalHTML);
          return;
        }

        // Extract post author
        const authorEl = post.querySelector('[data-view-name="feed-actor-image"]');
        const postAuthor = authorEl?.getAttribute('alt')?.replace(/\s*photo$/, '') || 'Unknown';

        // Check if voice is trained — warn if not
        const voiceCheck = await this.sendMessage({ type: 'GET_VOICE_STATUS' });
        if (!voiceCheck?.voiceProfile) {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
          btn.style.background = 'transparent';
          // Show a persistent warning instead of just generating with the fallback
          this.showInlineMessage(btn, 'Train your voice first (Engage tab)', originalHTML, 5000);
          return;
        }

        // Send to service worker for LLM generation
        const response = await this.sendMessage({
          type: 'GENERATE_REPLY',
          data: { postText, postAuthor }
        });

        if (!response || response.error) {
          this.showInlineMessage(btn, response?.error || 'Generation failed', originalHTML);
          return;
        }

        const reply = response.reply;

        // Open comment box
        const commentBtn = post.querySelector('[data-view-name="feed-comment-button"]');
        if (commentBtn) commentBtn.click();
        await this.sleep(800);

        // Find comment textbox
        const commentBox = post.querySelector('div[role="textbox"]') ||
                          document.querySelector('div[role="textbox"].tiptap');

        if (commentBox) {
          await this.fillCommentBox(commentBox, reply);

          // Check if auto-post is enabled
          const settings = await this.getSettings();
          if (settings.autoPost) {
            await this.sleep(500);
            await this.submitComment(post);
            this.logActivity('auto_posted', postAuthor, postText, reply);
          } else {
            this.logActivity('generated', postAuthor, postText, reply);
          }
        } else {
          this.showInlineMessage(btn, 'Could not find comment box', originalHTML);
          return;
        }

        // Restore button
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        btn.style.background = 'transparent';

      } catch (error) {
        console.error('LICON Feed Injector: Error generating reply', error);
        this.showInlineMessage(btn, error.message || 'Error', originalHTML);
      }
    }

    async fillCommentBox(textbox, text) {
      // Focus the textbox
      textbox.focus();
      await this.sleep(200);

      // Primary method: execCommand (works with most editors)
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, text);

      // Verify text was inserted
      await this.sleep(200);
      if (textbox.textContent.trim() === text.trim()) return;

      // Fallback: direct DOM manipulation for ProseMirror/TipTap
      const paragraph = textbox.querySelector('p') || textbox;
      paragraph.textContent = text;

      // Dispatch events so the editor framework picks up the change
      textbox.dispatchEvent(new Event('input', { bubbles: true }));
      textbox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async submitComment(post) {
      // Find submit button within the comment area
      const submitBtn = post.querySelector('button.comments-comment-box__submit-button') ||
                       post.querySelector('button[data-view-name="comment-submit-button"]') ||
                       post.querySelector('form.comments-comment-box__form button[type="submit"]');

      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
        console.log('LICON Feed Injector: Comment auto-submitted');
      }
    }

    logActivity(action, author, postText, reply) {
      this.sendMessage({
        type: 'ENGAGEMENT_ACTIVITY',
        data: {
          action,
          author,
          postSnippet: postText.slice(0, 100),
          reply,
          timestamp: Date.now()
        }
      });
    }

    showInlineMessage(btn, message, originalHTML, duration = 3000) {
      btn.innerHTML = `<span style="color:#c44;font-size:11px;">${message}</span>`;
      btn.style.background = 'rgba(204,68,68,0.05)';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
        btn.style.background = 'transparent';
      }, duration);
    }

    ensureSpinnerCSS() {
      if (document.getElementById('licon-spinner-css')) return;
      const style = document.createElement('style');
      style.id = 'licon-spinner-css';
      style.textContent = `
        .licon-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: rgba(0,0,0,0.6);
          border-radius: 50%;
          animation: licon-spin 0.6s linear infinite;
        }
        @keyframes licon-spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    observeFeed() {
      const observer = new MutationObserver(() => {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.injectButtons(), 500);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    async getSettings() {
      return new Promise((resolve) => {
        chrome.storage.sync.get({ liconEngagementSettings: {} }, (result) => {
          resolve(result.liconEngagementSettings || {});
        });
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
            console.error('LICON Feed Injector: Message error', chrome.runtime.lastError.message);
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiconFeedInjector());
  } else {
    new LiconFeedInjector();
  }
})();
