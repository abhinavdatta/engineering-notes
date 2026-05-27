# EngNotes - Template v2.4

This is the **template version** of EngNotes with all sensitive information replaced by placeholders.

## Quick Start

### Option 1: Cloudflare Pages (Recommended)

1. **Fork or clone this repository**
2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Pages > Create a project > Connect to Git
   - Select your repository

3. **Set Environment Variables**:
   - Go to Pages > Your Project > Settings > Environment Variables
   - Add the following variables:

   | Variable | Description | Required |
   |----------|-------------|----------|
   | `GOOGLE_DRIVE_API_KEY` | Your Google Drive API key | Yes |
   | `NOTES_FOLDER_ID` | Google Drive folder ID for notes | Yes |
   | `TEXTBOOKS_FOLDER_ID` | Google Drive folder ID for textbooks | Yes |
   | `CONTACT_EMAIL` | Your contact email | No |
   | `CACHE_TTL_HOURS` | Cache duration in hours (default: 24) | No |

4. **Deploy** - Cloudflare will automatically deploy your site

### Option 2: Static Hosting (Manual Config)

1. **Copy `js/config.example.js` to `js/config.js`**
2. **Replace placeholders with your actual values**
3. **Upload all files to your hosting provider**

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_DRIVE_API_KEY` | Google Drive API key | `AIzaSy...` |
| `NOTES_FOLDER_ID` | Folder ID for notes | `1SNnQiyuSNuJUSbs...` |
| `TEXTBOOKS_FOLDER_ID` | Folder ID for textbooks | `1qdcMtjkSDhOFol...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CONTACT_EMAIL` | Contact email address | `your-email@example.com` |
| `CACHE_TTL_HOURS` | Cache duration in hours | `24` |
| `ENABLE_ANALYTICS` | Enable analytics | `false` |
| `ENABLE_ADS` | Show ad placeholders | `true` |

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Create **API Key** (not OAuth)
5. Add **HTTP Referrer restriction**: `yourdomain.com/*`
6. Copy the API key to your environment variables

## Folder Structure for Google Drive

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

## Files Structure

```
template/
├── index.html          # Home page
├── notes.html          # Class resources page
├── textbooks.html      # Textbooks page
├── calculator.html     # GPA/CGPA calculator
├── CHANGELOG.html      # Version history
├── _worker.js          # Cloudflare Worker for env injection
├── wrangler.toml       # Cloudflare configuration
├── .env.example        # Environment variables template
├── js/
│   ├── config.js       # Environment configuration (PLACEHOLDERS)
│   ├── drive-api.js    # Google Drive API module
│   ├── navigation.js   # UI rendering
│   ├── calculator.js   # Calculator logic
│   └── ...
├── css/
│   ├── themes.css      # Theme variables
│   ├── common.css      # Shared styles
│   └── ...
└── docs/
    └── ...
```

## Local Development

1. Set up a local server (Python, Node.js, etc.)
2. Copy `js/config.js` and update with your values
3. Open `index.html` in browser
4. Check browser console for errors

## Security Notes

- **Never commit** `.env` or `config.js` with real credentials
- Use Cloudflare's Environment Variables for production
- Restrict your Google API key to your domain only
- The `_worker.js` injects env vars at runtime securely

## Deployment Checklist

Before deploying, ensure you've set:

- [ ] `GOOGLE_DRIVE_API_KEY` - In Cloudflare Dashboard
- [ ] `NOTES_FOLDER_ID` - In Cloudflare Dashboard
- [ ] `TEXTBOOKS_FOLDER_ID` - In Cloudflare Dashboard
- [ ] `CONTACT_EMAIL` - (optional)
- [ ] Google API Key restricted to your domain

## Support

For issues or questions, check:
1. Browser console for errors
2. Network tab for API call failures
3. Google Cloud Console for API key restrictions
4. Cloudflare Pages logs for Worker errors

## License

MIT License - Feel free to use and modify for your own projects.
