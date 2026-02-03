# LICON - LinkedIn Connector Toolkit

> Chrome extension that automates LinkedIn connection requests from company pages and search results.

## Features

- **Smart profile detection** — identifies Connect, Message, and Follow buttons automatically
- **Background processing** — opens profiles in background tabs without stealing focus
- **Multi-page pagination** — processes all pages in search results or company people listings
- **Real-time stats** — track processed, connected, skipped, and error counts live
- **Configurable delays** — randomized human-like timing between actions
- **Reset & export** — reset stats anytime, export failed profiles to CSV
- **Side panel UI** — clean card-based interface with intro guide for new users

## Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer Mode** (top right toggle)
4. Click **Load unpacked** and select the `licon/` folder
5. Pin LICON from the extensions menu

## How to Use

### 1. Navigate to a supported LinkedIn page

**Company people page:**
```
linkedin.com/company/google/people
```

**Search results with filters:**
```
linkedin.com/search/results/people?keywords=developer&network=%5B%22S%22%5D
```

### 2. Open LICON

Click the extension icon to open the side panel. If you're not on a supported page, LICON shows an intro screen with instructions and an "Open LinkedIn" button.

### 3. Configure settings

| Setting | Default | Description |
|---------|---------|-------------|
| Profile limit | 0 (unlimited) | Max profiles to process |
| Page limit | 0 (unlimited) | Max pages to process |
| Min delay | 2000ms | Minimum wait between actions |
| Max delay | 8000ms | Maximum wait between actions |
| Skip connected | On | Skip already-connected profiles |
| Auto scroll | On | Scroll to load all profiles on page |

### 4. Start

Hit **Start** at the bottom of the panel. LICON will:
- Scroll to load all profiles on the current page
- Process each profile one-by-one with random delays
- Handle connection modals automatically
- Move to next pages until limits are reached or pages run out

### 5. Monitor

Stats update in real-time. Use the **reset button** (top right) to clear counters for a fresh run. Page info shows during automation.

## How It Works

### Profile Processing

Each profile on the page is processed based on its button type:

- **Connect** — clicks the button, handles the modal, sends without a note
- **Message** — opens profile in a background tab, finds Connect via the More menu
- **Follow** — skipped (public figures, influencers)
- **Already connected** — skipped

### Architecture

```
User clicks Start
    ↓
Side panel → sends START_AUTOMATION to service worker
    ↓
Service worker → broadcasts to LinkedIn tabs
    ↓
Content script (main-automator.js) → scrolls, collects profiles, processes one-by-one
    ↓
For "Message" profiles → service worker opens background tab
    ↓
profile-connector.js → finds Connect button on profile page
    ↓
Stats update in real-time via Chrome messaging
```

### Error Handling

- Errors are logged and counted but never crash the process
- Failed profiles are tracked with reason codes (no button, modal failed, etc.)
- Export failed profiles to CSV for review

## Project Structure

```
licon/
├── manifest.json                        # Manifest V3 config
├── src/
│   ├── background/
│   │   └── service-worker.js            # State management, tab coordination
│   ├── content/
│   │   ├── main-automator.js            # Page scraping, profile processing
│   │   └── profile-connector.js         # Background tab connection logic
│   └── ui/
│       ├── sidepanel.html               # Side panel interface
│       └── sidepanel.js                 # UI logic, settings, polling
└── assets/
    └── icons/                           # Extension icons (16-400px)
```

## Technical Details

- **Manifest V3** — latest Chrome extension standard
- **Vanilla JS** — zero dependencies
- **Chrome APIs** — storage, tabs, scripting, sidePanel
- **All data stays local** — no external servers, Chrome Storage API only

### Permissions

| Permission | Why |
|------------|-----|
| `activeTab` | Access current LinkedIn tab |
| `tabs` | Create background tabs for profile processing |
| `storage` | Persist settings and stats locally |
| `scripting` | Inject automation scripts into LinkedIn pages |
| `sidePanel` | Side panel interface |

## Supported Pages

| Page Type | URL Pattern |
|-----------|-------------|
| Company people | `linkedin.com/company/*/people` |
| Search results | `linkedin.com/search/results/people?*` |

## Development

```bash
git clone https://github.com/AnshumanAtrey/licon.git
cd licon

# Make changes, then reload in Chrome:
# 1. Go to chrome://extensions/
# 2. Click refresh on LICON
# 3. Test
```

## Troubleshooting

**Extension not working**
- Make sure you're on a company people page or search results page
- Refresh the LinkedIn page and reopen the side panel

**No LICON icon**
- Click the puzzle piece in the Chrome toolbar and pin LICON

**Automation not starting**
- The page must be fully loaded before clicking Start
- Check the browser console for LICON debug logs

## Contributing

Issues and PRs welcome. When reporting bugs, include:
- Chrome version
- Steps to reproduce
- Console logs (filter by "LICON")

## License

MIT

## Built by [atrey.dev](https://atrey.dev)

<div align="center">
  <a href="https://atrey.dev">Website</a> &middot;
  <a href="https://github.com/AnshumanAtrey">GitHub</a> &middot;
  <a href="https://linkedin.com/in/anshumanatrey">LinkedIn</a>
</div>
