// LICON LLM Client - Multi-provider abstraction for AI engagement
class LiconLLMClient {
  constructor() {
    this.providers = {
      openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano'],
        buildHeaders(apiKey) {
          return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          };
        },
        buildBody(model, systemPrompt, userPrompt) {
          return JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 300,
            temperature: 0.7
          });
        },
        extractReply(data) {
          return data.choices?.[0]?.message?.content?.trim() || null;
        }
      },
      gemini: {
        name: 'Gemini',
        defaultModel: 'gemini-2.0-flash',
        models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'],
        getEndpoint(model, apiKey) {
          return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        },
        buildHeaders() {
          return { 'Content-Type': 'application/json' };
        },
        buildBody(model, systemPrompt, userPrompt) {
          return JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.7
            }
          });
        },
        extractReply(data) {
          return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
        }
      },
      anthropic: {
        name: 'Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-sonnet-4-20250514',
        models: ['claude-sonnet-4-20250514', 'claude-haiku-4-5-20251001'],
        buildHeaders(apiKey) {
          return {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          };
        },
        buildBody(model, systemPrompt, userPrompt) {
          return JSON.stringify({
            model,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            max_tokens: 300,
            temperature: 0.7
          });
        },
        extractReply(data) {
          return data.content?.[0]?.text?.trim() || null;
        }
      }
    };
  }

  async generate(provider, apiKey, systemPrompt, userPrompt, model) {
    const config = this.providers[provider];
    if (!config) throw new Error(`Unknown provider: ${provider}`);

    const useModel = model || config.defaultModel;
    const endpoint = config.getEndpoint
      ? config.getEndpoint(useModel, apiKey)
      : config.endpoint;
    const headers = config.buildHeaders(apiKey);
    const body = config.buildBody(useModel, systemPrompt, userPrompt);

    const response = await fetch(endpoint, { method: 'POST', headers, body });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || errorData.error?.status || response.statusText;
      throw new Error(`${config.name} API error (${response.status}): ${msg}`);
    }

    const data = await response.json();
    const reply = config.extractReply(data);
    if (!reply) throw new Error(`${config.name} returned empty response`);
    return reply;
  }

  async testConnection(provider, apiKey) {
    const config = this.providers[provider];
    if (!config) throw new Error(`Unknown provider: ${provider}`);

    try {
      const reply = await this.generate(
        provider, apiKey,
        'You are a test assistant.',
        'Reply with exactly: OK',
        config.defaultModel
      );
      return { success: true, message: `Connected to ${config.name}. Response: ${reply}` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  buildStyleSystemPrompt(voiceProfile) {
    if (!voiceProfile || !voiceProfile.comments || voiceProfile.comments.length === 0) {
      return `You ghostwrite LinkedIn comments for a real person. Your output must read like a genuine human wrote it — not an AI.

RULES:
- Write ONE comment. Nothing else. No preamble, no "Here's a comment:", no quotes around it.
- Be specific to the post content. Reference concrete details from the post.
- NEVER use these dead giveaways of AI slop: "Great post!", "Thanks for sharing!", "This resonates with me", "Couldn't agree more", "Love this!", "So true!", "This is spot on!"
- Keep it 15-40 words unless the post warrants more depth.
- Sound like a real person having a conversation, not a PR bot.`;
    }

    const h = voiceProfile.styleHints || {};
    const comments = voiceProfile.comments || [];

    // --- Build paired examples (post context + reply) ---
    const pairedExamples = [];
    const standaloneExamples = [];

    for (const c of comments.slice(0, 15)) {
      if (c.postContext && c.postContext.length > 20) {
        pairedExamples.push(`POST: "${c.postContext.slice(0, 200)}..."\nTHEIR REPLY: "${c.text}"`);
      } else {
        standaloneExamples.push(`"${c.text}"`);
      }
    }

    // Prefer paired examples (they show HOW the user responds to content)
    let examplesBlock = '';
    if (pairedExamples.length > 0) {
      examplesBlock += 'PAIRED EXAMPLES (post they replied to + their actual comment):\n';
      examplesBlock += pairedExamples.slice(0, 10).map((e, i) => `${i + 1}.\n${e}`).join('\n\n');
    }
    if (standaloneExamples.length > 0) {
      if (examplesBlock) examplesBlock += '\n\n';
      examplesBlock += 'MORE EXAMPLES OF THEIR COMMENTS:\n';
      examplesBlock += standaloneExamples.slice(0, 5).map((e, i) => `${i + 1}. ${e}`).join('\n');
    }

    // --- Build precise style fingerprint ---
    const styleParts = [];

    // Length
    if (h.medianLength) {
      styleParts.push(`LENGTH: Typically ${h.medianLength} words (range: ${h.minLength}-${h.maxLength}). Do NOT exceed ${Math.min(h.maxLength + 10, 120)} words.`);
    } else if (h.avgLength) {
      styleParts.push(`LENGTH: ~${h.avgLength} words.`);
    }

    // Sentence count
    if (h.avgSentences) {
      styleParts.push(`SENTENCES: Usually ${h.avgSentences <= 1.5 ? '1' : h.avgSentences <= 2.5 ? '1-2' : '2-3'} sentences per comment.`);
    }

    // Formality
    styleParts.push(`REGISTER: ${h.formality || 'conversational'}.`);

    // Emoji
    if (h.emojiFrequency > 50) {
      styleParts.push(`EMOJI: Uses emoji frequently (${h.emojiFrequency}% of comments). Favorites: ${h.topEmojis?.join(' ') || 'various'}`);
    } else if (h.emojiFrequency > 15) {
      styleParts.push(`EMOJI: Uses emoji sometimes (${h.emojiFrequency}% of comments). Tends to use: ${h.topEmojis?.join(' ') || 'various'}`);
    } else {
      styleParts.push('EMOJI: Rarely or never uses emoji. Do NOT add emoji.');
    }

    // Punctuation
    if (h.punctuation) {
      const pNotes = [];
      if (h.punctuation.exclamationRate > 40) pNotes.push('frequently uses !');
      else if (h.punctuation.exclamationRate < 10) pNotes.push('rarely uses !');
      if (h.punctuation.ellipsisRate > 20) pNotes.push('uses ... for trailing off');
      if (h.punctuation.dashRate > 20) pNotes.push('uses dashes for asides');
      if (h.punctuation.questionRate > 30) pNotes.push('often ends with a question');
      else if (h.punctuation.questionRate < 10) pNotes.push('rarely asks questions');
      if (pNotes.length > 0) styleParts.push(`PUNCTUATION: ${pNotes.join(', ')}.`);
    }

    // Capitalization
    if (h.capitalization === 'lowercase') {
      styleParts.push('CAPS: Writes in all lowercase (no capital letters). MATCH THIS.');
    } else if (h.capitalization === 'mixed') {
      styleParts.push('CAPS: Often skips capitalization at start of sentences.');
    }

    // Structure
    if (h.usesLineBreaks) {
      styleParts.push('STRUCTURE: Sometimes uses line breaks between thoughts.');
    }

    // Tone
    if (h.toneKeywords?.length) {
      styleParts.push(`TONE: Predominantly ${h.toneKeywords.join(', ')}.`);
    }

    // Behaviors
    const behaviors = [];
    if (h.sharesAnecdotes) behaviors.push('shares personal anecdotes');
    if (h.asksQuestions) behaviors.push('asks follow-up questions');
    if (h.tagsPeople) behaviors.push('sometimes @mentions people');
    if (h.usesHashtags) behaviors.push('uses hashtags');
    if (behaviors.length > 0) styleParts.push(`HABITS: ${behaviors.join(', ')}.`);

    // Openers
    if (h.dominantOpeners?.length) {
      styleParts.push(`OPENERS: Often starts comments with: ${h.dominantOpeners.join(', ')}.`);
    }
    if (h.samplePhrases?.length) {
      styleParts.push(`RECURRING PHRASES: ${h.samplePhrases.join(', ')}.`);
    }

    // Vocab
    if (h.vocabRichness) {
      if (h.vocabRichness > 75) styleParts.push('VOCABULARY: Varied and rich word choice. Avoids repetition.');
      else if (h.vocabRichness < 50) styleParts.push('VOCABULARY: Uses simple, direct language. Prefers common words.');
    }

    return `You are ghostwriting a LinkedIn comment AS this specific person. Your #1 job is to be INDISTINGUISHABLE from their real comments. Study their examples obsessively.

STYLE FINGERPRINT:
${styleParts.join('\n')}

${examplesBlock}

CRITICAL RULES:
1. Output ONLY the comment text. No quotes, no "Here's a comment:", no preamble.
2. Match their EXACT style — length, punctuation, capitalization, emoji usage, sentence structure. If they write in lowercase, YOU write in lowercase. If they never use emoji, YOU never use emoji.
3. Reference something SPECIFIC from the post. Generic responses are instant detection.
4. BANNED PHRASES (these scream AI): "Great post", "Thanks for sharing", "This resonates", "Couldn't agree more", "Love this", "So true", "This is spot on", "Well said", "Absolutely", "100%", "Spot on", "Great insight", "Great point"
5. If their examples show they disagree, push back, or ask hard questions — do that. Don't default to positivity.
6. Match their sentence count. If they write 1-sentence comments, write 1 sentence. Do NOT pad with filler.
7. Their voice is the source of truth. When in doubt, re-read their examples and mimic.`;
  }

  buildReplyUserPrompt(postText, postAuthor) {
    const truncated = (postText || '').slice(0, 1500);
    return `Post by ${postAuthor || 'someone'}:
---
${truncated}
---

Write a comment on this post in the user's voice. Output ONLY the comment text:`;
  }

  cleanReply(text) {
    if (!text) return text;
    let cleaned = text;

    // Strip wrapping quotes (straight or curly)
    cleaned = cleaned.replace(/^["'\u201C\u201D\u2018\u2019]+/, '').replace(/["'\u201C\u201D\u2018\u2019]+$/, '');

    // Strip common LLM preamble patterns
    const preambles = [
      /^Here'?s?\s+(a\s+)?(my\s+)?(suggested?\s+)?comment:?\s*/i,
      /^Sure[!,.]?\s*(here'?s?\s*(a\s+)?(my\s+)?comment:?\s*)?/i,
      /^(Comment|Reply|Response|My comment|My reply):?\s*/i,
      /^(I would (say|write|comment|reply)):?\s*/i,
      /^(As (the user|this person|them)):?\s*/i,
      /^(In (the user's|their) voice):?\s*/i,
    ];
    for (const pattern of preambles) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Strip trailing LLM meta-commentary
    cleaned = cleaned.replace(/\s*\(This comment[^)]*\)\s*$/i, '');
    cleaned = cleaned.replace(/\s*\[Note:[^\]]*\]\s*$/i, '');

    // Strip markdown bold/italic that doesn't belong in LinkedIn comments
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');

    // If the LLM wrote multiple "options", take only the first
    const optionSplit = cleaned.split(/\n\s*(Option \d|---|\d+\.)\s*/i);
    if (optionSplit.length > 1) {
      cleaned = optionSplit[0];
    }

    // Final trim
    cleaned = cleaned.trim();

    // If somehow empty after cleaning, return original
    return cleaned || text.trim();
  }

  getProviderModels(provider) {
    return this.providers[provider]?.models || [];
  }

  getDefaultModel(provider) {
    return this.providers[provider]?.defaultModel || '';
  }

  getProviderNames() {
    return Object.entries(this.providers).map(([key, val]) => ({
      key,
      name: val.name
    }));
  }
}

// Make available globally for importScripts in service worker
if (typeof self !== 'undefined') {
  self.LiconLLMClient = LiconLLMClient;
}
