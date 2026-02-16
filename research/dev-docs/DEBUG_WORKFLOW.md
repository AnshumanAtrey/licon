# 🔍 LICON Debug Workflow

## Current Issue Analysis

Based on the console logs, here's what's happening:

### ✅ **Working Steps:**
1. **Background script starts** ✅
2. **Side panel opens** ✅ 
3. **START_AUTOMATION message sent** ✅
4. **Content script injection** ✅
5. **Message broadcasting** ✅

### ❌ **Failing Step:**
6. **Content script not receiving AUTOMATION_STARTED message** ❌

## 🧪 Debug Steps to Follow

### Step 1: Check Content Script Loading
1. Open LinkedIn company people page
2. Open Chrome DevTools → Console
3. Look for these messages:
   ```
   🔥 LICON: Content script loaded on: [URL]
   🧪 LICON: Setting up test message listener...
   ✅ LICON: Test message listener set up
   🚀 LICON: Initializing main automator...
   ```

### Step 2: Test Message Reception
1. Click LICON extension icon
2. Click "Start Automation"
3. Check console for:
   ```
   🧪 LICON: TEST - Received message in content script: {type: "PING"}
   🧪 LICON: TEST - Received message in content script: {type: "AUTOMATION_STARTED"}
   ```

### Step 3: Check Background Script
1. Go to chrome://extensions/
2. Click "service worker" link under LICON
3. Look for:
   ```
   📨 LICON: Sending "AUTOMATION_STARTED" to tab [ID]
   ✅ LICON: Message sent successfully to tab [ID]
   ```

## 🔧 Enhanced Logging Added

### Content Script Enhancements:
- **Dual message listeners** - Test listener + main listener
- **PING/PONG system** - To test message reception
- **Comprehensive initialization logging**
- **Error tracking with stack traces**

### Background Script Enhancements:
- **PING test before message sending**
- **Retry logic** - 3 attempts with delays
- **Better content script injection detection**
- **Enhanced error reporting**

## 🎯 Expected Console Output

### When Working Correctly:
```
🔥 LICON: Content script loaded on: https://www.linkedin.com/company/firecrawl/people/
🧪 LICON: Setting up test message listener...
✅ LICON: Test message listener set up
🚀 LICON: Initializing main automator...
🔧 LICON: LiconMainAutomator constructor called
🔧 LICON: Setting up message listener...
✅ LICON: Message listener set up in LiconMainAutomator
🔧 LICON: Initializing automator...
⚙️ LICON: Getting settings from background...
✅ LICON: Settings received: {minDelay: 2000, maxDelay: 8000, ...}
🔍 LICON: Is company people page: true
📊 LICON: Detecting page info...
✅ LICON: Ready on LinkedIn company people page

[User clicks Start Automation]

🧪 LICON: TEST - Received message in content script: {type: "PING"}
🧪 LICON: TEST - PING received, responding
📨 LICON: LiconMainAutomator received message: {type: "AUTOMATION_STARTED"}
📨 LICON: Content script handling message: AUTOMATION_STARTED
🚀 LICON: Content script received AUTOMATION_STARTED - starting automation...
🔥 LICON: Starting automation...
📜 LICON: Loading all profiles...
👥 LICON: Processing profiles...
🔍 LICON: Found X profiles to process
```

## 🚨 Troubleshooting

### If Content Script Not Loading:
1. Check if you're on the exact URL pattern: `/company/*/people/`
2. Refresh the page
3. Reload the extension

### If Messages Not Received:
1. Check Chrome extension permissions
2. Look for JavaScript errors in console
3. Try reloading the extension

### If Automation Not Starting:
1. Check if profiles are found on the page
2. Verify LinkedIn page structure hasn't changed
3. Check for rate limiting or LinkedIn blocks

## 🔄 Next Steps

1. **Test the enhanced logging** - Load the updated extension
2. **Follow debug steps** - Check each step in sequence  
3. **Report findings** - Share console output for analysis
4. **Fix identified issues** - Based on debug results

The enhanced logging should now clearly show where the message flow is breaking!