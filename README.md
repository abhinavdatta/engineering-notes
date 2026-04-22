# Visit the website 
press or click [here](https://enginotes.pages.dev/pages/notes)



## Features

- **Google Drive Integration** - All content fetched dynamically from Google Drive
- **Smart Caching** - 24-hour localStorage cache to reduce API calls
- **Cookie Consent** - GDPR-style consent banner for caching
- **Theme Support** - Light, Dark, and Pure Black/AMOLED themes
- **Separate Caches** - Notes and Textbooks maintain independent caches
- **Refresh Button** - Manual cache refresh without page reload
- **Responsive Design** - Works on all devices

## Setup

### 1. Google Drive API Key

Add your API key in `js/drive-api.js`:

```javascript
var API_KEY = 'YOUR_API_KEY_HERE';
```

### 2. Root Drive Folder IDs

Set the root folder IDs in HTML pages BEFORE loading drive-api.js:

```html
<!-- In pages/notes.html -->
<script>
  window.ROOT_FOLDER_ID = 'YOUR_NOTES_FOLDER_ID';
</script>
<script src="../js/drive-api.js"></script>

<!-- In pages/textbooks.html -->
<script>
  window.ROOT_FOLDER_ID = 'YOUR_TEXTBOOKS_FOLDER_ID';
</script>
<script src="../js/drive-api.js"></script>
```

### 3. Contact Links

Update in all HTML files (`index.html`, `pages/notes.html`, `pages/textbooks.html`):

```html
<!-- About - GitHub Profile -->
<a href="https://github.com/YOUR_USERNAME">

<!-- Report Issues -->
<a href="https://github.com/YOUR_USERNAME/YOUR_REPO/issues">

<!-- Email -->
<a href="https://mail.google.com/mail/?view=cm&fs=1&to=YOUR_EMAIL@gmail.com">
```

### 4. Google Cloud Console

1. Enable **Drive API**
2. Create **API Key**
3. Add **HTTP Referrer restriction**: `yourdomain.com/*`

## How It Works

**Everything is fetched dynamically from Google Drive!** No manual data file updates needed.

### Folder Structure in Google Drive

```
Root Folder (Notes/Textbooks)
├── Computer Science (Department)
│   ├── Sem 3 (or Semester 3)
│   │   ├── Data Structures (Subject)
│   │   │   ├── Unit-1 (or U-1, Module-1)
│   │   │   │   └── [PDF files here]
│   │   │   └── Unit-2
│   │   └── Algorithms
│   └── Sem 4
├── Electronics (ECE)
│   └── ...
```

### Folder Naming Conventions

The system auto-detects:

| Type | Examples |
|------|----------|
| **Semester** | `Sem 3`, `Semester 3`, `S3`, `3rd Sem` |
| **Unit** | `Unit-1`, `U-1`, `unit 1`, `Module-1`, `Chapter-1` |
| **Department** | Based on keywords like `Computer`, `Electronics`, `Civil`, etc. |

### Adding New Content

Just add folders/files in Google Drive and click **Refresh** button - everything updates automatically!

## Caching System

### How Caching Works

1. **First Visit** - User sees cookie consent banner
2. **Accept Cookies** - Folder structure is cached in localStorage (24 hours)
3. **Return Visit** - Data loaded from cache (0 API calls!)
4. **Refresh Button** - Manually update cache when needed

### Separate Caches

Notes and Textbooks maintain **completely separate caches**:

- Notes page caches data from Notes Drive folder
- Textbooks page caches data from Textbooks Drive folder
- Cache keys include folder ID prefix to prevent mixing
- Refresh on Notes page only clears Notes cache

### Cache Keys

Cache keys are prefixed with the first 8 characters of ROOT_FOLDER_ID:

```
drive_1SNnQiyu_structure    (Notes structure cache)
drive_1qdcMtjk_structure    (Textbooks structure cache)
drive_1SNnQiyu_folders_...  (Notes folder cache)
drive_1qdcMtjk_folders_...  (Textbooks folder cache)
```

## Deploy

Upload `deploy/` folder to Cloudflare Pages or any static hosting.

## File Structure

```
deploy/
├── index.html              # Home page
├── README.md               # This file
├── CHANGELOG.html          # Version history
├── robots.txt              # SEO
├── css/
│   ├── themes.css          # Theme variables
│   ├── common.css          # Shared styles
│   ├── notes.css           # Notes page styles
│   ├── textbooks.css       # Textbooks page styles
│   ├── home.css            # Home page styles
│   ├── ads.css             # Ad spaces
│   └── cookie-consent.css  # Cookie banner styles
├── js/
│   ├── drive-api.js        # Google Drive API (core)
│   ├── navigation.js       # UI rendering
│   ├── cookie-consent.js   # Cookie consent & cache manager
│   ├── notes-app.js        # Notes page init
│   ├── textbooks-app.js    # Textbooks page init
│   ├── home-app.js         # Home page init
│   ├── theme-manager.js    # Theme switching
│   └── bot-protection.js   # Basic security
└── pages/
    ├── notes.html          # Class Resources page
    └── textbooks.html      # Textbooks page
```

## API Configuration

| Setting | Value |
|---------|-------|
| **API Key** | Set in `js/drive-api.js` |
| **Notes Drive ID** | Set in `pages/notes.html` |
| **Textbooks Drive ID** | Set in `pages/textbooks.html` |
| **Cache TTL** | 24 hours (86400000 ms) |

## Version History

See `CHANGELOG.html` for complete version history.
### Version (v1.5)

- **Added:** Comprehensive mobile responsive design with 4 breakpoints (768px, 480px, 360px)
- **Added:** Mobile card views for all table data (departments, subjects, files)
- **Fixed:** Notes page was missing mobile card view on home page
- **Improved:** Touch-optimized UI elements, horizontal scrolling filters, proper stacking layouts
- 
### Version (v1.4)

- **Fixed:** Cache separation bug - Notes and Textbooks now have completely separate caches
- **Changed:** ROOT_FOLDER_ID now uses dynamic getter function `getRootFolderId()`
- This ensures correct folder ID is always used, even when browser caches script execution

## License

MIT License - Feel free to use and modify for your own projects.
