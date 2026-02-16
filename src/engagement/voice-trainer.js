// LICON Voice Trainer - Scrapes user's past LinkedIn comments to learn writing style
(function() {
  if (window.__liconVoiceTrainerLoaded) return;
  window.__liconVoiceTrainerLoaded = true;

  class LiconVoiceTrainer {
    constructor() {
      this.maxScrollAttempts = 10;
      this.init();
    }

    async init() {
      console.log('LICON Voice Trainer: Starting on', window.location.href);
      await this.waitForPageLoad();

      try {
        const result = await this.scrapeComments();
        await this.sendMessage({
          type: 'VOICE_TRAINING_COMPLETE',
          data: result
        });
      } catch (error) {
        console.error('LICON Voice Trainer: Error', error);
        await this.sendMessage({
          type: 'VOICE_TRAINING_COMPLETE',
          data: { success: false, error: error.message }
        });
      }

      // Close tab after sending results
      setTimeout(() => {
        this.sendMessage({ type: 'CLOSE_TAB' });
      }, 1000);
    }

    async waitForPageLoad() {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 3000);
        } else {
          window.addEventListener('load', () => setTimeout(resolve, 3000));
        }
      });
    }

    async scrapeComments() {
      // Get target comment count from storage
      const settings = await this.getSettings();
      const targetCount = settings.commentCount || 15;

      // Scroll to load comments
      await this.scrollToLoadComments(targetCount);

      // Collect comment elements
      const commentEntities = document.querySelectorAll(
        'section.comments-comment-entity__content, div.comments-comment-item'
      );

      if (commentEntities.length === 0) {
        // Fallback: try broader selectors
        const fallbackComments = document.querySelectorAll('[class*="comment-item"], [class*="comment-entity"]');
        if (fallbackComments.length === 0) {
          return { success: false, error: 'No comments found on page. Make sure you have public comments.' };
        }
      }

      // Get user's profile slug for filtering
      const profileSlug = this.getUserProfileSlug();

      // Extract comment text
      const comments = [];
      const allCommentEls = document.querySelectorAll('span.comments-comment-item__main-content');

      for (const el of allCommentEls) {
        if (comments.length >= targetCount) break;

        const text = el.textContent?.trim();
        if (!text || text.length < 10) continue;

        // Try to get the parent comment entity to check authorship
        const entity = el.closest('[class*="comment-entity"], [class*="comment-item"]');
        if (entity && profileSlug) {
          const authorLink = entity.querySelector('a[href*="/in/"]');
          if (authorLink && !authorLink.href.includes(profileSlug)) {
            continue; // Not the user's comment
          }
        }

        // Try to grab the original post context
        let postContext = '';
        const activityItem = el.closest('[class*="activity"], [class*="feed"]');
        if (activityItem) {
          const postEl = activityItem.querySelector('[data-view-name="feed-commentary"], [class*="feed-shared-text"]');
          if (postEl) {
            postContext = postEl.textContent?.trim().slice(0, 300) || '';
          }
        }

        comments.push({
          text,
          postContext,
          scrapedAt: Date.now()
        });
      }

      if (comments.length === 0) {
        return { success: false, error: 'Could not extract any comments. The page may have a different layout.' };
      }

      // Build style profile from comments
      const styleHints = this.analyzeStyle(comments);

      return {
        success: true,
        voiceProfile: {
          comments,
          commentCount: comments.length,
          lastTrainedAt: Date.now(),
          styleHints
        }
      };
    }

    analyzeStyle(comments) {
      const texts = comments.map(c => c.text);

      // --- Length distribution (not just average) ---
      const wordCounts = texts.map(t => t.split(/\s+/).length);
      wordCounts.sort((a, b) => a - b);
      const avgLength = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
      const medianLength = wordCounts[Math.floor(wordCounts.length / 2)];
      const minLength = wordCounts[0];
      const maxLength = wordCounts[wordCounts.length - 1];

      // --- Emoji analysis (not just boolean) ---
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{200D}\u{FE0F}]/gu;
      const emojiStats = { count: 0, commentsWithEmoji: 0, favorites: {} };
      for (const t of texts) {
        const matches = t.match(emojiRegex);
        if (matches) {
          emojiStats.commentsWithEmoji++;
          for (const e of matches) {
            emojiStats.count++;
            emojiStats.favorites[e] = (emojiStats.favorites[e] || 0) + 1;
          }
        }
      }
      const emojiFrequency = Math.round((emojiStats.commentsWithEmoji / texts.length) * 100);
      const topEmojis = Object.entries(emojiStats.favorites)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([emoji]) => emoji);

      // --- Punctuation habits ---
      const punctuation = {
        exclamation: texts.filter(t => t.includes('!')).length,
        ellipsis: texts.filter(t => t.includes('...') || t.includes('\u2026')).length,
        dash: texts.filter(t => t.includes(' - ') || t.includes('\u2014') || t.includes('\u2013')).length,
        semicolon: texts.filter(t => t.includes(';')).length,
        question: texts.filter(t => t.includes('?')).length
      };

      // --- Capitalization patterns ---
      const capsPatterns = {
        allLowercase: texts.filter(t => t === t.toLowerCase()).length,
        startsLowercase: texts.filter(t => t[0] === t[0]?.toLowerCase() && t[0] !== t[0]?.toUpperCase()).length,
        usesAllCaps: texts.filter(t => /\b[A-Z]{2,}\b/.test(t)).length
      };

      // --- Sentence structure ---
      const sentenceCounts = texts.map(t => {
        const sentences = t.split(/[.!?]+/).filter(s => s.trim().length > 3);
        return sentences.length;
      });
      const avgSentences = Math.round((sentenceCounts.reduce((a, b) => a + b, 0) / sentenceCounts.length) * 10) / 10;

      // --- Line breaks / paragraph structure ---
      const multiParagraph = texts.filter(t => t.includes('\n')).length;
      const usesLineBreaks = multiParagraph > texts.length * 0.2;

      // --- Formality signals ---
      const allLower = texts.join(' ').toLowerCase();
      const formalSignals = (allLower.match(/\b(furthermore|consequently|regarding|nevertheless|thus|hence|moreover|indeed|certainly)\b/g) || []).length;
      const casualSignals = (allLower.match(/\b(lol|haha|tbh|imo|btw|ngl|idk|gonna|wanna|kinda|gotta|yeah|yep|nah|dude|folks|super|totally|literally|honestly|basically)\b/g) || []).length;
      const formality = formalSignals > casualSignals * 2 ? 'formal'
        : casualSignals > formalSignals * 2 ? 'casual'
        : 'conversational';

      // --- Vocabulary richness ---
      const allWords = texts.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const uniqueWords = new Set(allWords);
      const vocabRichness = allWords.length > 0 ? Math.round((uniqueWords.size / allWords.length) * 100) : 0;

      // --- Common opening patterns (first 2 words, lowered threshold) ---
      const openings = {};
      for (const t of texts) {
        const words = t.split(/\s+/);
        // Try 2-word and 3-word openings
        for (const len of [2, 3]) {
          const opening = words.slice(0, len).join(' ').toLowerCase();
          if (opening.length > 3) {
            openings[opening] = (openings[opening] || 0) + 1;
          }
        }
      }
      const samplePhrases = Object.entries(openings)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([phrase]) => phrase);

      // Also capture unique first words to detect patterns like always starting with "I", "This", "Great"
      const firstWords = {};
      for (const t of texts) {
        const firstWord = t.split(/\s+/)[0]?.toLowerCase();
        if (firstWord) firstWords[firstWord] = (firstWords[firstWord] || 0) + 1;
      }
      const dominantOpeners = Object.entries(firstWords)
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => `"${word}" (${count}/${texts.length})`);

      // --- Tone analysis (weighted by frequency, not binary) ---
      const toneScores = {};
      const tonePatterns = {
        enthusiastic: /\b(great|awesome|amazing|love|excellent|fantastic|incredible|brilliant|wonderful|exciting)\b/g,
        thoughtful: /\b(interesting|curious|wonder|think|consider|perspective|reflect|ponder|nuance)\b/g,
        agreeable: /\b(agree|exactly|right|true|absolutely|definitely|certainly|spot on|well said|this\s*[!.])\b/g,
        contrarian: /\b(however|but|although|disagree|actually|counterpoint|challenge|pushback|devil.s advocate)\b/g,
        grateful: /\b(thanks|thank you|appreciate|grateful|shout.?out)\b/g,
        humorous: /\b(haha|lol|funny|joke|hilarious|laughing|rofl|lmao)\b/g,
        supportive: /\b(congrats|congratulations|well done|proud|bravo|kudos|way to go|keep it up|inspiring)\b/g,
        analytical: /\b(data|research|study|evidence|metrics|analysis|trend|statistic|percent|finding)\b/g,
        personal: /\b(i've|i have|my experience|in my|personally|i remember|i once|i think|i feel|i believe)\b/g
      };
      for (const [tone, regex] of Object.entries(tonePatterns)) {
        const matches = allLower.match(regex);
        if (matches) toneScores[tone] = matches.length;
      }
      // Sort by frequency, take top tones
      const toneKeywords = Object.entries(toneScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([tone]) => tone);
      if (toneKeywords.length === 0) toneKeywords.push('neutral');

      // --- Behavioral patterns ---
      const sharesAnecdotes = texts.filter(t => /\b(i remember|i once|in my experience|when i|i had a|reminds me)\b/i.test(t)).length;
      const asksQuestions = punctuation.question;
      const tagsPeople = texts.filter(t => t.includes('@')).length;
      const usesHashtags = texts.filter(t => /#\w+/.test(t)).length;

      return {
        // Length
        avgLength,
        medianLength,
        minLength,
        maxLength,
        // Emoji
        emojiFrequency,  // percent of comments with emoji
        topEmojis,
        // Punctuation
        punctuation: {
          exclamationRate: Math.round((punctuation.exclamation / texts.length) * 100),
          ellipsisRate: Math.round((punctuation.ellipsis / texts.length) * 100),
          dashRate: Math.round((punctuation.dash / texts.length) * 100),
          questionRate: Math.round((punctuation.question / texts.length) * 100)
        },
        // Structure
        capitalization: capsPatterns.allLowercase > texts.length * 0.5 ? 'lowercase'
          : capsPatterns.startsLowercase > texts.length * 0.3 ? 'mixed' : 'standard',
        avgSentences,
        usesLineBreaks,
        formality,
        vocabRichness,
        // Patterns
        toneKeywords,
        samplePhrases,
        dominantOpeners,
        // Behaviors
        sharesAnecdotes: sharesAnecdotes > 0,
        asksQuestions: asksQuestions > texts.length * 0.15,
        tagsPeople: tagsPeople > 0,
        usesHashtags: usesHashtags > 0,
        totalCommentsAnalyzed: texts.length
      };
    }

    getUserProfileSlug() {
      // Try to extract from page URL
      const urlMatch = window.location.href.match(/linkedin\.com\/in\/([^\/]+)/);
      if (urlMatch) return urlMatch[1];

      // Try from the page's profile link
      const profileLink = document.querySelector('a[href*="/in/me"]') ||
                          document.querySelector('a.global-nav__primary-link--active[href*="/in/"]');
      if (profileLink) {
        const match = profileLink.href.match(/\/in\/([^\/\?]+)/);
        if (match) return match[1];
      }

      return null;
    }

    async scrollToLoadComments(targetCount) {
      let attempts = 0;
      let lastHeight = 0;

      while (attempts < this.maxScrollAttempts) {
        attempts++;

        // Check if we have enough comments
        const currentComments = document.querySelectorAll('span.comments-comment-item__main-content');
        if (currentComments.length >= targetCount) break;

        // Scroll down
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        await this.sleep(2000);

        // Check if page grew
        if (document.body.scrollHeight === lastHeight) break;
        lastHeight = document.body.scrollHeight;

        // Click "Show more" if present
        const showMore = document.querySelector('button.scaffold-finite-scroll__load-button');
        if (showMore && showMore.offsetParent !== null) {
          showMore.click();
          await this.sleep(2000);
        }
      }
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
            console.error('LICON Voice Trainer: Message error', chrome.runtime.lastError.message);
          }
          resolve(response);
        });
      });
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  new LiconVoiceTrainer();
})();
