# Visit the website 
press or click [here](https://enginotes.pages.dev/pages/notes)

## Setup

### 1. Google Drive API Key

Add your API key in `pages/notes.html` and `pages/textbooks.html`:

```javascript
var API_KEY = 'YOUR_API_KEY_HERE';
```

### 2. Root Drive Folder IDs

Update the root folder IDs in `pages/notes.html` and `pages/textbooks.html`:

```javascript
// In notes.html
var ROOT_FOLDER_ID = 'YOUR_NOTES_FOLDER_ID';

// In textbooks.html
var ROOT_FOLDER_ID = 'YOUR_TEXTBOOKS_FOLDER_ID';
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
3. Add **HTTP Referrer restriction**: `enginotes.pages.dev/*`

## How It Works Now

**Everything is fetched dynamically from Google Drive!** No more manual data file updates.

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
| **Unit** | `Unit-1`, `U-1`, `unit 1`, `Module-1` |
| **Department** | Based on keywords like `Computer`, `Electronics`, `Civil`, etc. |

### Adding New Content

Just add folders/files in Google Drive and **refresh the page** - everything updates automatically!

## Deploy

Upload `deploy/` folder to Cloudflare Pages.

## Structure

```
deploy/
├── index.html
├── README.md
├── robots.txt
└── pages/
    ├── notes.html
    └── textbooks.html
```
