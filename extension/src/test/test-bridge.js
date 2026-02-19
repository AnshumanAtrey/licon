// LICON Test Bridge
// =================
// Patches LiconSidePanel for tab context, exposes window.licon API,
// and adds structured console logging for Claude Code integration.
//
// Claude Code usage:
//   javascript_tool  -> await licon.snapshot()
//   read_console_messages -> pattern: "[LICON]"
//   read_page / find / computer -> interact with the UI

// --- Logging ---

const _logEntries = [];

function tlog(level, msg, data) {
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const entry = { ts, level, msg, data };
  _logEntries.push(entry);

  const prefix = `[LICON][${level.toUpperCase()}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    console.log(`${prefix} ${msg}`);
  }

  appendLogUI(entry);
}

function appendLogUI(entry) {
  const el = document.getElementById('logOutput');
  if (!el) return;
  const div = document.createElement('div');
  div.className = 'log-entry';
  const levelClass = entry.level === 'error' ? 'level-error' : entry.level === 'warn' ? 'level-warn' : 'level-info';
  const dataStr = entry.data !== undefined
    ? ` <span class="data">${typeof entry.data === 'string' ? entry.data : JSON.stringify(entry.data, null, 0)}</span>`
    : '';
  div.innerHTML = `<span class="timestamp">${entry.ts}</span> <span class="${levelClass}">${entry.level}</span> <span class="msg">${entry.msg}</span>${dataStr}`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

// --- Message helper ---

function sendMsg(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// --- Patch LiconSidePanel init for test context ---

async function patchPanel() {
  const panel = window.liconPanel;
  if (!panel) {
    tlog('error', 'LiconSidePanel instance not found on window.liconPanel');
    return;
  }

  tlog('info', 'Patching panel for test context...');

  // Find a LinkedIn tab to use as "current tab"
  const tabs = await chrome.tabs.query({ url: '*://www.linkedin.com/*' });
  const linkedInTab = tabs.find(t =>
    t.url?.match(/linkedin\.com\/company\/[^\/]+\/people/) ||
    t.url?.match(/linkedin\.com\/search\/results\/people/)
  ) || tabs[0] || null;

  if (linkedInTab) {
    tlog('info', 'Found LinkedIn tab', { id: linkedInTab.id, url: linkedInTab.url });
    panel.currentTab = linkedInTab;
    panel.checkLinkedInPage();
  } else {
    tlog('warn', 'No LinkedIn tab open - showing intro screen. Open LinkedIn and refresh.');
  }

  // Re-load status and settings now that tab is patched
  await panel.loadStatus();
  await panel.loadSettings();
  await panel.loadFailedProfiles();

  tlog('info', 'Panel patched and ready');
}

// --- window.licon API ---

window.licon = {
  // Full state snapshot
  async snapshot() {
    const [status, settings, failed] = await Promise.all([
      sendMsg({ type: 'GET_STATUS' }),
      sendMsg({ type: 'GET_SETTINGS' }),
      sendMsg({ type: 'GET_FAILED_PROFILES' }),
    ]);
    const result = { status, settings, failedProfiles: failed.failedProfiles };
    tlog('info', 'snapshot', result);
    return result;
  },

  // Status & stats
  async getStatus() {
    const resp = await sendMsg({ type: 'GET_STATUS' });
    tlog('info', 'getStatus', resp);
    if (window.liconPanel) {
      window.liconPanel.isRunning = resp.isRunning;
      window.liconPanel.stats = resp.stats || window.liconPanel.stats;
      window.liconPanel.updateUI();
    }
    return resp;
  },

  // Settings
  async getSettings() {
    const resp = await sendMsg({ type: 'GET_SETTINGS' });
    tlog('info', 'getSettings', resp);
    return resp;
  },

  async saveSettings(settings) {
    await sendMsg({ type: 'SAVE_SETTINGS', data: settings });
    tlog('info', 'saveSettings', settings);
    if (window.liconPanel) await window.liconPanel.loadSettings();
    return { success: true };
  },

  // Automation control
  async start(tabUrl) {
    if (!tabUrl) {
      const tabs = await chrome.tabs.query({ url: '*://www.linkedin.com/*' });
      const target = tabs.find(t =>
        t.url?.match(/linkedin\.com\/company\/[^\/]+\/people/) ||
        t.url?.match(/linkedin\.com\/search\/results\/people/)
      );
      if (!target) {
        tlog('error', 'No LinkedIn people/search tab found');
        return { error: 'No LinkedIn people/search tab found. Open one first.' };
      }
      tabUrl = target.url;
      tlog('info', 'Auto-selected LinkedIn tab', tabUrl);
    }

    const resp = await sendMsg({ type: 'START_AUTOMATION', data: { companyUrl: tabUrl } });
    tlog('info', 'start', resp);
    if (window.liconPanel) {
      window.liconPanel.isRunning = true;
      window.liconPanel.currentTab = { url: tabUrl };
      window.liconPanel.updateUI();
      window.liconPanel.showCompanyInfo(tabUrl);
    }
    return resp;
  },

  async stop() {
    const resp = await sendMsg({ type: 'STOP_AUTOMATION' });
    tlog('info', 'stop', resp);
    if (window.liconPanel) {
      window.liconPanel.isRunning = false;
      window.liconPanel.updateUI();
    }
    return resp;
  },

  async resetStats() {
    const resp = await sendMsg({ type: 'RESET_STATS' });
    tlog('info', 'resetStats', resp);
    if (window.liconPanel) await window.liconPanel.loadStatus();
    return resp;
  },

  // Failed profiles
  async getFailedProfiles() {
    const resp = await sendMsg({ type: 'GET_FAILED_PROFILES' });
    tlog('info', 'getFailedProfiles', { count: resp.failedProfiles?.length || 0 });
    return resp;
  },

  async clearFailedProfiles() {
    const resp = await sendMsg({ type: 'CLEAR_FAILED_PROFILES' });
    tlog('info', 'clearFailedProfiles', resp);
    if (window.liconPanel) {
      window.liconPanel.failedProfiles = [];
      window.liconPanel.renderFailedProfiles();
    }
    return resp;
  },

  // List available LinkedIn tabs
  async listLinkedInTabs() {
    const tabs = await chrome.tabs.query({ url: '*://www.linkedin.com/*' });
    const info = tabs.map(t => ({ id: t.id, url: t.url, title: t.title }));
    tlog('info', 'listLinkedInTabs', info);
    return info;
  },

  // Switch which LinkedIn tab the panel targets
  async useTab(tabId) {
    const tab = await chrome.tabs.get(tabId);
    if (window.liconPanel) {
      window.liconPanel.currentTab = tab;
      window.liconPanel.checkLinkedInPage();
    }
    tlog('info', 'useTab', { id: tab.id, url: tab.url });
    return { id: tab.id, url: tab.url };
  },

  // Get log entries (for programmatic access)
  getLogs(last) {
    return last ? _logEntries.slice(-last) : _logEntries;
  },
};

// --- Console UI: tab switching ---

document.querySelectorAll('.console-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.console-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.console-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// --- Console UI: JS eval input ---

async function runFromInput() {
  const input = document.getElementById('jsInput');
  const code = input.value.trim();
  if (!code) return;

  tlog('info', '> ' + code);
  try {
    const result = await eval(code);
    tlog('info', 'Result:', result);
  } catch (err) {
    tlog('error', 'Error: ' + err.message);
  }
  input.value = '';
}

window.runAPI = async function(method) {
  tlog('info', `> licon.${method}()`);
  try {
    const result = await window.licon[method]();
    tlog('info', `Result:`, result);
  } catch (err) {
    tlog('error', `Error: ${err.message}`);
  }
};

document.getElementById('runBtn').addEventListener('click', runFromInput);
document.getElementById('jsInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runFromInput();
});

// --- Init ---

tlog('info', 'Test bridge loading...');

// Wait a tick for LiconSidePanel to finish constructing, then patch
setTimeout(async () => {
  try {
    await patchPanel();
    tlog('info', 'window.licon API ready. Available methods:');
    tlog('info', '  licon.snapshot()         - full state dump');
    tlog('info', '  licon.getStatus()        - running + stats');
    tlog('info', '  licon.getSettings()      - settings');
    tlog('info', '  licon.saveSettings({})   - update settings');
    tlog('info', '  licon.start()            - start automation');
    tlog('info', '  licon.stop()             - stop automation');
    tlog('info', '  licon.resetStats()       - reset counters');
    tlog('info', '  licon.getFailedProfiles()- list failures');
    tlog('info', '  licon.listLinkedInTabs() - find LI tabs');
    tlog('info', '  licon.useTab(tabId)      - switch target tab');
  } catch (err) {
    tlog('error', 'Init failed: ' + err.message);
  }
}, 500);
