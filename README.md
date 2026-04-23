# 📚 EngNotes - Engineering Notes & Textbooks Website

A clean, responsive website for sharing engineering notes and textbooks using Google Drive API.

## 🚀 Quick Setup

### 1. Google Drive API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create API credentials (API Key)
5. Copy your API key

### 2. Configure the Website

Open `js/drive-api.js` and replace:
```javascript
var API_KEY = 'YOUR_API_KEY_HERE';
```

### 3. Set Up Your Google Drive Folders

1. Create folders in Google Drive for Notes and Textbooks
2. Make folders public (anyone with link can view)
3. Copy folder IDs from URLs

Open HTML files and replace folder IDs:
```html
<script>
  window.ROOT_FOLDER_ID = 'YOUR_NOTES_FOLDER_ID';  // For notes.html
  window.ROOT_FOLDER_ID = 'YOUR_TEXTBOOKS_FOLDER_ID';  // For textbooks.html
</script>
```

### 4. Update Contact Information

Replace placeholder email and GitHub links:
- `YOUR_EMAIL@example.com` → Your email
- `github.com/YOUR_USERNAME` → Your GitHub
- `your-domain.com` → Your domain

## 📁 Folder Structure

```
template/
├── index.html          # Home page
├── pages/
│   ├── notes.html      # Class Resources page
│   └── textbooks.html  # Textbooks page
├── css/
│   ├── themes.css      # Theme variables
│   ├── common.css      # Shared styles
│   ├── home.css        # Home page styles
│   ├── notes.css       # Notes page styles
│   ├── textbooks.css   # Textbooks page styles
│   ├── ads.css         # Ad spaces
│   └── cookie-consent.css
├── js/
│   ├── drive-api.js    # Google Drive integration
│   ├── navigation.js   # Navigation & UI
│   ├── theme-manager.js
│   ├── cookie-consent.js
│   ├── notes-app.js
│   ├── textbooks-app.js
│   ├── home-app.js
│   └── bot-protection.js
└── CHANGELOG.html
```

## 🎨 Features

- **3 Themes**: Light, Dark, Pure Black (AMOLED)
- **Responsive Design**: Works on all devices
- **Google Drive Integration**: Dynamic content loading
- **Smart Caching**: 24-hour cache with cookie consent
- **Department Navigation**: Browse by department
- **Semester Filtering**: Filter subjects by semester

## 📝 Placeholder Reference

| Placeholder | Description |
|-------------|-------------|
| `YOUR_API_KEY_HERE` | Google Drive API Key |
| `YOUR_NOTES_FOLDER_ID` | Google Drive folder ID for notes |
| `YOUR_TEXTBOOKS_FOLDER_ID` | Google Drive folder ID for textbooks |
| `YOUR_EMAIL@example.com` | Contact email address |
| `github.com/YOUR_USERNAME` | Your GitHub profile |
| `your-domain.com` | Your website domain |

## 📄 License

MIT License - Feel free to use and modify!

---

Made with ❤️ for engineering students
