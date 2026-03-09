# EngNotes

Engineering Notes & Textbooks for Students

## Setup

### 1. Google Drive API Key

Add your API key in `pages/notes.html` and `pages/textbooks.html`:

```javascript
var API_KEY = 'YOUR_API_KEY_HERE';
```

### 2. Google Drive Links

Update drive links in `pages/notes.html` and `pages/textbooks.html`:

```html
<!-- Notes Drive -->
<a href="https://drive.google.com/drive/folders/YOUR_NOTES_FOLDER_ID">

<!-- Textbooks Drive -->
<a href="https://drive.google.com/drive/folders/YOUR_TEXTBOOKS_FOLDER_ID">
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
3. Add **HTTP Referrer restriction**: `YOUR WEBSITE LINK`

### 5. Data Files

Update `pages/notes-data.js` and `pages/textbooks-data.js` with your folder structure.

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
    ├── textbooks.html
    ├── notes-data.js
    └── textbooks-data.js
```
