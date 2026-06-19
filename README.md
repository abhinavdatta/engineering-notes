<div align="center">

# 📚 EngiNotes

**Engineering Notes & Textbooks Platform**

A modern static website where engineering students can access notes, textbooks, question papers, and lab manuals — all powered by Google Drive, with smart caching, multi-theme support, and a built-in GPA/CGPA calculator.

[![Version](https://img.shields.io/badge/version-3.2.1-blue?style=flat-square)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange?style=flat-square)](https://pages.cloudflare.com/)

</div>

---

## ✨ Features

| Category | Highlights |
|----------|-----------|
| 📁 **Content** | Google Drive integration, 24-hour smart caching, GDPR cookie consent |
| 🎨 **Design** | Light / Dark / AMOLED themes, animated star background, glassmorphism cards, hover aura effects |
| 🧮 **Tools** | Internal marks calculator, GPA/CGPA calculator, "What If" grade projector |
| 🔒 **Security** | 15-layer bot protection, Cloudflare Worker API proxy (key never hits the client) |
| 📊 **SEO** | JSON-LD structured data, Open Graph tags, Twitter Cards, per-page meta tags |

---

## 🚀 Quick Start

Pick the setup that fits your deployment target:

### Option 1 — Cloudflare Pages ⭐ (Recommended)

Most secure: your API key stays server-side, never in the browser.

1. Fork or clone this repo and push to GitHub.

2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages → Create → Connect to Git**, link your repo.

3. Add these environment variables under **Settings → Environment Variables**:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `GOOGLE_DRIVE_API_KEY` | Google Drive API key | `AIzaSy...` |
   | `NOTES_FOLDER_ID` | Root folder ID for notes | `1SNnQiyu...` |
   | `TEXTBOOKS_FOLDER_ID` | Root folder ID for textbooks | `1qdcMtjk...` |

4. Set the API key as a **Cloudflare Secret** for the Worker:
   ```bash
   npm install -g wrangler
   wrangler login
   wrangler secret put GOOGLE_DRIVE_API_KEY
   # Paste your key when prompted
   ```

5. Cloudflare deploys automatically on every push. Done.

---

### Option 2 — Static Hosting (GitHub Pages, Netlify, Vercel)

> ⚠️ **Security note:** This approach exposes your API key in the browser console. Use Option 1 for any public deployment.

1. Copy the config template:
   ```bash
   cp js/config.example.js js/config.js
   ```

2. Fill in your values in `js/config.js`:
   ```javascript
   window.CONFIG = {
     GOOGLE_DRIVE_API_KEY: 'YOUR_GOOGLE_DRIVE_API_KEY',
     NOTES_FOLDER_ID:      'YOUR_NOTES_FOLDER_ID',
     TEXTBOOKS_FOLDER_ID:  'YOUR_TEXTBOOKS_FOLDER_ID',
     CONTACT_EMAIL:        'your-email@example.com',
     CACHE_TTL_HOURS:      24,
     ENABLE_ANALYTICS:     false,
     ENABLE_ADS:           true
   };
   ```

3. Upload all files to your host and you're live.

---

### Option 3 — Local Development

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then copy `config.js` with your credentials (see Option 2) and open `http://localhost:8000`.

---

## ⚙️ Setup Guide

### 1 — Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and create or select a project.
2. Enable the **Google Drive API**.
3. Create an **API Key** under **Credentials → Create Credentials → API Key**.
4. Restrict the key: set **HTTP referrers** to `yourdomain.com/*` (add `localhost:*` for local testing).
5. Copy the key.

---

### 2 — Google Drive Folder Structure

Create two root folders in Drive and organize them like this:

**Notes:**
```
Notes/
├── Computer Science/
│   ├── Sem 1/
│   │   ├── Data Structures/
│   │   │   ├── Unit-1/
│   │   │   │   ├── notes.pdf
│   │   │   │   ├── question-paper.pdf
│   │   │   │   └── lab-manual.pdf
│   │   │   └── Unit-2/
│   │   └── Algorithms/
│   └── Sem 2/
├── Electronics (ECE)/
└── Mechanical (ME)/
```

**Textbooks:**
```
Textbooks/
├── Computer Science/
│   ├── Sem 1/
│   │   └── Data Structures/
│   │       ├── Unit-1/
│   │       │   ├── textbook.pdf
│   │       │   └── reference-book.pdf
│   │       └── Unit-2/
│   └── Sem 2/
└── Electronics (ECE)/
```

---

### 3 — Get Folder IDs

Open each root folder in Google Drive and grab the ID from the URL:

```
https://drive.google.com/drive/folders/THIS_IS_YOUR_FOLDER_ID
```

Repeat for both the Notes and Textbooks folders.

---

## 🗂️ File Structure

```
enginotes/
├── index.html              # Home page
├── notes.html              # Class Resources
├── textbooks.html          # Textbooks
├── calculator.html         # GPA/CGPA calculator
├── privacy.html            # Privacy policy
├── CHANGELOG.html / .md    # Version history
├── _worker.js              # Cloudflare Worker (API proxy)
├── wrangler.toml           # Worker configuration
├── js/
│   ├── config.example.js   # ← copy this to config.js
│   ├── config.js           # Your local config (gitignored)
│   ├── drive-api.js        # Google Drive API client
│   ├── navigation.js       # UI rendering
│   ├── calculator.js       # Calculator logic
│   ├── cookie-consent.js   # Consent banner & cache
│   ├── theme-manager.js    # Theme switching
│   ├── bot-protection.js   # Bot detection
│   ├── logger.js           # Debug logging
│   ├── notes-app.js        # Notes page init
│   ├── textbooks-app.js    # Textbooks page init
│   └── home-app.js         # Home page init
├── css/
│   ├── themes.css          # CSS variables (colors, spacing)
│   ├── base.css            # Reset & typography
│   ├── layout.css          # Navbar, footer, containers
│   ├── components.css      # Buttons, cards, modals
│   ├── utilities.css       # Helper classes
│   ├── home.css
│   ├── notes.css
│   ├── textbooks.css
│   ├── calculator.css
│   ├── cookie-consent.css
│   └── ads.css
```

---

## 🎨 Department Color Codes

Departments are auto-detected from folder names and color-coded throughout the UI:

| Department | Code | Color |
|------------|------|-------|
| Electronics & Instrumentation | EIE | 🔴 Red `#ef4444` |
| Electronics & Communication | ECE | 🟠 Orange `#f97316` |
| Electrical & Electronics | EEE | 🟡 Yellow `#eab308` |
| Computer Science | CSE | 🟢 Green `#22c55e` |
| Mechanical | ME | 🩵 Cyan `#06b6d4` |
| Civil | CE | 🔵 Blue `#3b82f6` |
| Information Technology | IT | 🟣 Purple `#8b5cf6` |
| Artificial Intelligence | AI | 🩷 Pink `#ec4899` |
| AI & Data Science | AIDS | 🩷 Pink `#ec4899` |

---

## 📱 Naming Conventions

The app auto-parses these common naming patterns:

**Semesters:** `Sem 1`, `Semester 1`, `S1`, `1st Sem`

**Units:** `Unit-1`, `U-1`, `Module-1`, `Chapter-1`

---

## 🔧 Advanced Configuration

### API Proxy (Cloudflare Worker)

`_worker.js` proxies all Drive requests so your API key is never sent to the client.

**Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `/api/drive/list?folderId=ID` | List folders and files |
| `/api/drive/files?folderId=ID` | List files only |
| `/api/drive/folder?fileId=ID` | Get folder metadata |

---

### Caching

Caching is opt-in via the cookie consent banner:

| State | Behavior |
|-------|----------|
| Accepted | 24-hour localStorage cache (`enginotes-notes-data`, `enginotes-textbooks-data`) |
| Declined | Fresh fetch on every visit |
| Brave browser | Cache blocked by Brave policies |

**Clear cache manually (browser console):**
```javascript
localStorage.clear();
// Or target a specific key:
localStorage.removeItem('enginotes-notes-data');
```

---

### Themes

| Theme | Description |
|-------|-------------|
| Light | Default bright theme |
| Dark | Slate colors, reduced contrast |
| Pure Black | AMOLED-optimized — great for OLED screens |

Theme preference is persisted in `localStorage`.

---

## 🔒 Security

### API Key

- **Cloudflare Pages (recommended):** key stored as a Cloudflare Secret, proxied through `_worker.js` — never reaches the browser.
- **Static hosting:** store in `config.js`, add `config.js` to `.gitignore`, and **never commit it**.

### Bot Protection

A 15-layer scoring system blocks automated scrapers:

1. Headless Chrome detection
2. PhantomJS detection
3. WebDriver flag check
4. PhantomJS properties
5. Nightmare.js detection
6. Chrome automation check
7. Plugins validation
8. Languages validation
9. Screen dimension check
10. Window Chrome object check
11. Timing-based detection
12. DevTools protocol check
13. Permissions API check
14. WebGL fingerprinting
15. Scoring threshold (≥4 points → blocked)

### CSP Headers (Optional)

Add a `/_headers` file for Cloudflare Pages:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleusercontent.com; frame-src 'self' https://drive.google.com;
```

---

## 🌐 Deployment Options

| Platform | SSL | CDN | Worker Support | Setup |
|----------|-----|-----|----------------|-------|
| **Cloudflare Pages** ⭐ | ✅ | ✅ Global | ✅ | Push to Git → auto-deploy |
| **Netlify / Vercel** | ✅ | ✅ | ✅ Edge functions | Push to Git → auto-deploy |
| **GitHub Pages** | ✅ | Partial | ❌ | Enable in repo settings |
| **Static host** | ❌ Usually | ❌ | ❌ | Manual FTP/upload |

---

## 🧪 Pre-Deploy Checklist


- [ ] Test on localhost with a real API key
- [ ] All pages load without console errors
- [ ] Theme switching works (all 3 themes)
- [ ] Cookie consent — accept and decline flows
- [ ] Notes page loads departments and navigates correctly
- [ ] Textbooks page loads departments
- [ ] File preview and download work
- [ ] All calculators produce correct results
- [ ] Mobile layout at 768px and 480px
- [ ] Brave browser — caching gracefully blocked


---

## 📊 Analytics (Optional)

1. Create a Google Analytics account and get your tracking ID (`GA-XXXXXXXXXX`).
2. In `js/config.js`:
   ```javascript
   ENABLE_ANALYTICS: true,
   GA_TRACKING_ID: 'GA-XXXXXXXXXX'
   ```
3. Add the tracking script to your HTML files.

---

## 🤝 Contributing

Contributions welcome. Good places to start:

- New themes or UI/UX improvements
- Additional calculator modes
- Bug fixes

Open an issue or submit a PR.

---

## 🎯 Version History

### Current Version: 3.2.1

**v3.2.1 - Theme Background Fix:**
- Fixed theme background not changing in index.html
- Fixed CSS selector from `body:not([data-theme="dark"]):not([data-theme="pure-black"])` to `html:not([data-theme="dark"]):not([data-theme="pure-black"]) body`
- Added smooth transition for theme background changes
- Fixed minor bugs

**v3.2 - Bug Fixes & UX Improvements:**
- Fixed cookie consent "Change" button (DECLENSED → DECLINED typo)
- Fixed navigation state management with `hideAllViews()` call
- Fixed department view bug where subjects appeared below departments
- Added beautiful hover aura gradient effects on interactive elements
- Multi-layered glowing auras on feature cards
- Animated rotating gradient halos on buttons
- Smooth underlines with glow effects on navigation links
- Pulsing background glow on footer elements
- Improved browser back button navigation

**v3.1.6:**
- Cookie consent "Change" button now works for both accepted and declined states
- Fixed navigation bug where subjects appeared below departments when going back
- Enhanced hover aura gradient effects on interactive elements
- Updated Privacy Policy with latest security features and Cloudflare Worker details
- Improved view state management for seamless navigation

**Previous Major Features (v3.1.0 - v3.1.5):**
- Complete API key removal from client-side (zero exposure)
- API proxy for secure key storage via Cloudflare Workers
- Enhanced bot protection (15 detection methods)
- Folder and file ordering fixes (alphabetical sorting)
- Environment variable debugging tools
- Content Security Policy headers
- Rate limiting and bot detection
- Department color variables for all themes
- Debug logging system (Logger.js)
- CSS architecture improvements (split CSS)
- Complete SEO meta tags

**Security Improvements:**
- API key never exposed to browser console
- All Drive API calls go through Worker proxy
- Zero client-side API key references
- Cloudflare Secrets for secure key management

See [CHANGELOG.html](CHANGELOG.html) for complete version history.

---

## 📝 License

MIT — free to use and modify for your own projects.

---

<div align="center">Made with ❤️ for engineering students</div>
