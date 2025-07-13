<div align="center">
  <img src="licon-banner.png" alt="Licon Banner" width="60%"/>
</div>

# 🤖 **Licon — The LinkedIn Connector Toolkit**

> Effortlessly grow your LinkedIn network by connecting with employees of any company — directly from the "People" page.

---

### 🛠️ Built by [atrey.dev](https://atrey.dev)

---

## ⚡ **Features**

- 🔄 Auto-scrolls through the entire “People” list on LinkedIn company pages
- 🔘 Detects and clicks the **"Connect"** buttons one-by-one
- ⏳ Adds human-like randomized delays between actions
- ✉️ Handles the popup and clicks **"Send without a note"**
- 🧼 Stops automatically when all connections are sent or buttons are gone

---

## 🚀 **Quick Start**

1. **Go to the LinkedIn People Page of a Company**
   - Example:  
     `https://www.linkedin.com/company/google/people/`

2. **Open Developer Console**
   - **Windows/Linux:** `Ctrl + Shift + J`  
   - **Mac:** `Cmd + Option + J`

3. **Paste the Script**
   - Go to the raw script link:
     [browser-script.js (raw)](https://raw.githubusercontent.com/AnshumanAtrey/licon/refs/heads/main/browser-script.js)
   - Copy all the code from that page.
   - Paste it into your browser's developer console.

4. **Hit Enter and Let Licon Work!**

---

## 🧑‍💻 **How Licon Works**

- Scrolls to the bottom of the page
- Clicks "Show more results" until it's gone
- Clicks each visible **Connect** button
- Waits for the modal and clicks **Send without a note**
- Repeats until all visible people are invited

---

> **Notes:**
> - Licon only connects with people currently visible on the "People" tab of a company.
> - It does **not** send duplicate invites or connect with people already connected.

---

## 🧭 **Planned Features**

- Custom note messaging
- AI-based invite personalization
- Target filters (e.g., job title, location)
- Engagement analytics

---

> ⚠️ **Disclaimer:**
> Use this tool responsibly. Automated actions on LinkedIn may violate their Terms of Service.  
> Licon is intended for educational purposes only. The author is not responsible for any misuse or account restrictions.