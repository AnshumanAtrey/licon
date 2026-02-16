# LICON Competitive Analysis & Feature Research

**Date:** 2026-02-13
**Competitors Analyzed:** OctopusCRM, Dux-Soup, Waalaxy, Expandi, LinkedHelper

---

## Competitor Breakdown

### 1. OctopusCRM (octopuscrm.io)
- **Type:** Chrome Extension
- **Pricing:** $6.99-$39.99/mo (annual), $9.99-$39.99/mo (monthly)
- **Key Features:**
  - Personalized connection requests with templates
  - Bulk messaging to 1st-level connections
  - Auto endorse skills
  - Auto visit profiles
  - Marketing funnels (connect -> thank you -> endorse -> follow-up)
  - Connect by email (bypass weekly invite limit)
  - Import/export profiles (CSV)
  - Zapier and HubSpot integration
  - Campaign statistics and analytics (profile views, SSI, acceptance rates)
  - Activity control (excessive activity alerts)
  - Compatible with Free, Premium, Sales Navigator, Recruiter Lite

### 2. Dux-Soup (dux-soup.com)
- **Type:** Chrome Extension + Cloud option
- **Pricing:** $11.25-$74.17/mo (annual), $14.99-$99/mo (monthly)
- **Key Features:**
  - Personalized connection invitations
  - Personalized messages to 1st-degree connections
  - Auto-like LinkedIn posts
  - Visit and tag profiles
  - Unlimited drip campaigns (Turbo+)
  - Up to 12 actions per campaign: Endorse, Follow, InMail, Connect, Message, Visit, Like
  - Detect responses and pause campaigns
  - Drag and drop campaign steps
  - Campaign statistics and lead management dashboard
  - Central inbox
  - Contact management system (built-in CRM)
  - Profile tagging and search
  - Integrations: Slack, Salesforce, Pipedrive, HubSpot, Freshsales
  - Zapier and Make libraries
  - Compatible with LinkedIn, Sales Navigator, Recruiter

### 3. Waalaxy (waalaxy.com)
- **Type:** Chrome Extension
- **Pricing:** Free (80 invites/mo), Pro ~$21/mo, Advanced ~$63/mo, Business ~$90/mo
- **Key Features:**
  - Automated invitations, messages, profile visits
  - Up to 800 invitations per month
  - 99+ pre-made campaign templates
  - Smart reply detection
  - CRM Sync to 2000+ tools
  - CSV imports and exports
  - Imports from LinkedIn Basic, Sales Navigator, Recruiter Lite
  - Duplicate prevention
  - Email Finder (find professional emails)
  - Cold email sequences (Business plan)
  - AI message writer (Waami)
  - AI prospect list cleaner / prospect finder
  - LinkedIn Inbox add-on (manage conversations, schedule follow-ups, tag leads)
  - Team collaboration (shared leads, team analytics, anti-duplicate)
  - Free tier available

### 4. Expandi (expandi.io)
- **Type:** Cloud-based (not a Chrome extension)
- **Pricing:** $99/mo (Business), Custom (Agency 10+ seats)
- **Key Features:**
  - Cloud-based with dedicated country-based IP address
  - Profile auto warm-up
  - Smart algorithms for safe limit ranges
  - Campaign types that bypass outreach limits
  - Multichannel outreach (LinkedIn + email)
  - Image, GIF, and video personalization in messages
  - Detailed step-by-step campaign statistics
  - Flexible scheduling
  - Dynamic placeholders
  - Tags and notes to conversations
  - Duplication prevention and blacklist
  - Integrations via webhooks

### 5. LinkedHelper (linkedhelper.com)
- **Type:** Standalone desktop app
- **Pricing:** $8.25-$24.75/mo (annual), $15-$45/mo (monthly)
- **Key Features:**
  - Automated connection invitations with personal notes
  - Auto-responder for new connections
  - Drip campaign messaging with reply detection
  - InMail automation
  - Messages to group members, event attendees
  - Email finder (95% discovery rate)
  - Profile scraping (people and company data)
  - CSV export
  - CRM integrations: HubSpot, Pipedrive, Salesforce, Zoho, etc.
  - Auto follow profiles
  - Skill endorsement automation
  - Post/article liking and commenting
  - Multi-source lead targeting (groups, alumni, profile viewers, events)
  - Customizable message chains/funnels
  - Advanced scheduling with timezone support
  - Built-in CRM with notes and tagging

---

## LICON Current Features

- Auto-connect on company people pages
- Auto-connect on search results pages
- Profile limit and page limit settings
- Min/max delay configuration
- Skip already connected profiles
- Auto-scroll to load profiles
- Failed profiles tracking and export
- Real-time stats (processed, connected, skipped, errors)
- Skip reason breakdown (already connected, pending, no connect button, follow only)
- Background tab profile connection (More -> Connect flow)
- Single-tab automation (prevents multi-tab conflicts)

---

## Recommended Features for LICON

### Tier 1: Must-Have (Build First)

| # | Feature | Description | Competitors | Effort |
|---|---------|-------------|-------------|--------|
| 1 | **Auto-Accept Connection Requests** | Navigate to My Network invitations page, click Accept on pending requests. Optional keyword filter (by title, company, etc.) to selectively accept. | None prominently — **unique differentiator** | Easy |
| 2 | **Personalized Connection Notes** | Allow users to write connection request messages with dynamic placeholders: `{firstName}`, `{lastName}`, `{company}`, `{title}`. Save multiple templates. Fill in the "Add a note" field during connect flow. | All 5 competitors | Medium |
| 3 | **Profile Visit Automation** | Visit hundreds of profiles automatically to trigger "who viewed your profile" notifications. People check who viewed them and often connect back. Low risk, high reward. | OctopusCRM, Dux-Soup, Waalaxy, LinkedHelper | Easy |
| 4 | **CSV Export of All Profiles** | Export all processed profiles (name, title, company, URL, connection status, date, button type) to CSV. LICON already has partial export for failed profiles. | All 5 competitors | Easy |
| 5 | **Duplicate Prevention / Contact History** | Store all previously contacted profile URLs permanently in chrome.storage so users never contact the same person twice across sessions. Blacklist feature to exclude specific people or companies. | Waalaxy, Expandi, LinkedHelper | Easy |
| 6 | **Activity Safety Limits** | Track weekly connection request total with warnings near LinkedIn's ~100/week limit. Auto-pause when approaching the limit. Display weekly counter in side panel. | OctopusCRM, Expandi, LinkedHelper | Easy |
| 7 | **Campaign Stats Dashboard** | Show acceptance rate (accepted/attempted), daily/weekly trends, and a simple visual chart. LICON already shows basic counts — extend with rate calculations and history stored in chrome.storage. | All 5 competitors | Medium |

### Tier 2: Nice-to-Have (Strong Differentiators)

| # | Feature | Description | Competitors | Effort |
|---|---------|-------------|-------------|--------|
| 8 | **Auto-Endorse Skills** | Endorse skills on target profiles as a warm-up action before connecting. Triggers a notification and creates goodwill. | OctopusCRM, Dux-Soup, LinkedHelper | Easy |
| 9 | **Auto-Like Posts** | Like recent posts from target profiles to warm up before connecting. | Dux-Soup, Waalaxy | Easy |
| 10 | **Auto-Message 1st Connections** | Send bulk personalized messages to existing connections. Great for follow-up after connecting (thank-you or intro messages). | OctopusCRM, Dux-Soup, Waalaxy, LinkedHelper | Medium |
| 11 | **Message Templates Library** | Save, organize, and reuse message templates with variable placeholders. Quick-select from saved templates. Store in chrome.storage.sync. | Waalaxy, Expandi, LinkedHelper | Medium |
| 12 | **Import from CSV/URL List** | Allow users to paste or upload a list of LinkedIn profile URLs to process. Extension navigates to each URL and connects. | OctopusCRM, Dux-Soup, Waalaxy, LinkedHelper | Medium |
| 13 | **Sales Navigator Support** | Detect and support Sales Navigator search results and lead list pages (different DOM selectors). | All 5 competitors | Medium |
| 14 | **Auto-Follow Profiles** | Follow profiles automatically to get their content in your feed and trigger a follow notification. | Dux-Soup, LinkedHelper | Easy |

### Tier 3: Future / Advanced

| # | Feature | Description | Competitors | Effort |
|---|---------|-------------|-------------|--------|
| 15 | **Drip Campaign / Sequence Builder** | Multi-step campaigns: Visit -> Connect -> Wait 2 days -> Message -> Wait 3 days -> Follow up. Reply detection stops the sequence. | Dux-Soup, Waalaxy, Expandi, LinkedHelper | Hard |
| 16 | **Email Finder** | Find professional email addresses from LinkedIn profiles using third-party APIs (Hunter.io, Snov.io). | Waalaxy, LinkedHelper, Expandi | Hard (needs API) |
| 17 | **CRM Integrations** | Push profile data to HubSpot, Salesforce, Pipedrive via Zapier webhooks. | All 5 competitors | Hard |
| 18 | **AI Message Writing** | Generate personalized connection notes using an LLM API based on prospect's profile info. | Waalaxy | Hard (needs API) |
| 19 | **InMail Automation** | Automate InMail for 2nd/3rd degree connections (requires Premium/Sales Nav). | Dux-Soup, LinkedHelper | Medium |
| 20 | **Team / Multi-Account** | Shared campaigns, anti-duplicate across team members. | Waalaxy, Expandi | Hard (needs backend) |

---

## Recommended Build Order

```
Phase 1 (Quick Wins — 1-2 weeks):
  1. Auto-Accept Connection Requests (unique differentiator)
  2. CSV Export of All Profiles
  3. Duplicate Prevention / Contact History
  4. Activity Safety Limits (weekly cap)

Phase 2 (Core Value — 2-4 weeks):
  5. Personalized Connection Notes with Placeholders
  6. Profile Visit Automation
  7. Campaign Stats Dashboard with Acceptance Rate

Phase 3 (Growth Features — 4-6 weeks):
  8. Auto-Endorse Skills
  9. Auto-Like Posts
  10. Auto-Message 1st Connections
  11. Message Templates Library

Phase 4 (Premium Features — 6+ weeks):
  12. Import from CSV/URL List
  13. Sales Navigator Support
  14. Drip Campaign / Sequence Builder
```

---

## Key Strategic Insight

**Auto-Accept Connection Requests** is LICON's biggest opportunity. None of the 5 major competitors prominently feature it, yet it's a massive pain point for power users, recruiters, and content creators who receive 50-100+ connection requests daily. Making this LICON's signature feature would create a unique market position and drive word-of-mouth adoption.

**Pricing Reference:**
- Budget tools: $7-15/mo (OctopusCRM, LinkedHelper)
- Mid-range: $21-63/mo (Waalaxy)
- Premium: $99/mo (Expandi)
- LICON could target the $10-20/mo range with a free tier (limited daily connections)
