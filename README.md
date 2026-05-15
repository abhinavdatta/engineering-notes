# EngNotes - Template v2.3

This is the **template version** of EngNotes with all sensitive information replaced by placeholders.

## Setup Instructions

### 1. Google Drive API Key

Replace the placeholder in `js/drive-api.js`:

```javascript
// Find this line:
var API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY';

// Replace with your actual API key:
var API_KEY = 'your-actual-api-key-here';
```

### 2. Google Drive Folder IDs

Replace the folder IDs in the respective HTML files:

**In `notes.html`:**
```javascript
// Find this line:
window.ROOT_FOLDER_ID = 'YOUR_NOTES_FOLDER_ID';

// Replace with your Notes folder ID:
window.ROOT_FOLDER_ID = '1abc...your-folder-id';
```

**In `textbooks.html`:**
```javascript
// Find this line:
window.ROOT_FOLDER_ID = 'YOUR_TEXTBOOKS_FOLDER_ID';

// Replace with your Textbooks folder ID:
window.ROOT_FOLDER_ID = '1xyz...your-folder-id';
```

### 3. Email Addresses

Replace all instances of `your-email@example.com` with your actual email:

**Files to update:**
- `index.html`
- `notes.html`
- `textbooks.html`

**Find:** `your-email@example.com`  
**Replace with:** `your-actual-email@gmail.com`

### 4. Links (Optional)

Update these placeholder links in all HTML files:

| Placeholder | Replace With |
|-------------|--------------|
| `href="#"` (About) | Your GitHub profile or website |
| `href="#"` (Report) | Your issue tracker URL |
| `href="#"` (GitHub) | Your GitHub profile |
| `YOUR_NOTES_FOLDER_ID` | Your Google Drive Notes folder ID |
| `YOUR_TEXTBOOKS_FOLDER_ID` | Your Google Drive Textbooks folder ID |

### 5. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Create **API Key** (not OAuth)
5. Add **HTTP Referrer restriction**: `yourdomain.com/*`
6. Copy the API key to `js/drive-api.js`

## Folder Structure for Your Google Drive

```
Root Folder (Notes)
├── Computer Science
│   ├── Sem 1
│   │   ├── Subject Name
│   │   │   ├── Unit-1
│   │   │   │   └── notes.pdf
│   │   │   └── Unit-2
│   │   └── Another Subject
│   ├── Sem 2
│   └── ...
├── Electronics
└── ...

Root Folder (Textbooks)
├── Computer Science
│   ├── Sem 1
│   │   ├── Subject Name
│   │   │   ├── Unit-1
│   │   │   └── Unit-2
│   │   └── ...
│   └── ...
└── ...
```

### Supported Naming Patterns

**Semester Detection:**
- `Sem 1`, `Sem 2`, `Sem 3`, etc.
- `Semester 1`, `Semester 2`, etc.
- `S1`, `S2`, `S3`, etc.
- `1st Sem`, `2nd Sem`, etc.

**Unit Detection:**
- `Unit-1`, `Unit-2`, etc.
- `U-1`, `U-2`, etc.
- `Module-1`, `Module-2`, etc.
- `Chapter-1`, `Chapter-2`, etc.

## Department Codes

The system auto-detects department codes from folder names:

| Department | Code | Color |
|------------|------|-------|
| Artificial Intelligence / AIDS | AIDS | Pink |
| Civil | CE | Blue |
| Computer Science | CSE | Green |
| Electronics | ECE | Orange |
| Electrical | EEE | Yellow |
| Instrumentation | EIE | Red |
| Information Technology | IT | Purple |
| Mechanical | ME | Cyan |

## Testing Locally

1. Set up a local server (e.g., Python, Node.js)
2. Open `index.html` in browser
3. Check browser console for errors
4. Verify Google Drive API calls work

## Deployment

Upload all files to:
- **Cloudflare Pages** (recommended)
- **GitHub Pages**
- **Netlify**
- Any static hosting

## Files Checklist

Before deploying, ensure you've updated:

- [ ] `js/drive-api.js` - API key
- [ ] `notes.html` - ROOT_FOLDER_ID
- [ ] `textbooks.html` - ROOT_FOLDER_ID
- [ ] `index.html` - Email addresses and links
- [ ] `notes.html` - Email addresses and links
- [ ] `textbooks.html` - Email addresses and links
- [ ] `CHANGELOG.html` - Config section with your IDs

## Support

For issues or questions, check:
1. Browser console for errors
2. Network tab for API call failures
3. Google Cloud Console for API key restrictions

## License

MIT License - Feel free to use and modify for your own projects.
