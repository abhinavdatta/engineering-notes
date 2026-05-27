/**
 * ============================================================
 * CONFIG.JS - Site Configuration
 * ============================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Replace the placeholder values below with your actual credentials
 * 2. Get a Google Drive API Key from: https://console.cloud.google.com
 * 3. Create Google Drive folders for notes and textbooks
 * 4. Copy the folder IDs from the URLs
 * 
 * GOOGLE DRIVE SETUP:
 * 1. Go to https://drive.google.com
 * 2. Create folders for your notes and textbooks
 * 3. The folder ID is in the URL: drive.google.com/drive/folders/FOLDER_ID_HERE
 * 4. Make sure folders are public or shared with "Anyone with the link"
 * 
 * SECURITY NOTE:
 * Since you're using direct upload deployment, your source code
 * is not publicly visible. However, DO NOT share your deploy
 * folder or ZIP file with anyone you don't trust.
 * ============================================================
 */

(function() {
  'use strict';

  // ============================================
  // EDIT THESE VALUES FOR YOUR SITE
  // ============================================
  window.CONFIG = {
    // Google Drive API Key - Get from Google Cloud Console
    GOOGLE_DRIVE_API_KEY: 'YOUR_GOOGLE_DRIVE_API_KEY',
    
    // Google Drive Folder IDs - Copy from folder URL
    NOTES_FOLDER_ID: 'YOUR_NOTES_FOLDER_ID',
    TEXTBOOKS_FOLDER_ID: 'YOUR_TEXTBOOKS_FOLDER_ID',
    
    // Your Contact Email
    CONTACT_EMAIL: 'your-email@example.com',
    
    // Cache Duration (hours) - How long to cache folder data
    CACHE_TTL_HOURS: 24,
    
    // Feature Flags
    ENABLE_ANALYTICS: false,
    ENABLE_ADS: true,
    
    // ============================================
    // DO NOT EDIT BELOW THIS LINE
    // ============================================
    
    isConfigured: function() {
      return !!(
        this.GOOGLE_DRIVE_API_KEY && 
        this.GOOGLE_DRIVE_API_KEY !== 'YOUR_GOOGLE_DRIVE_API_KEY' &&
        this.NOTES_FOLDER_ID && 
        this.NOTES_FOLDER_ID !== 'YOUR_NOTES_FOLDER_ID' &&
        this.TEXTBOOKS_FOLDER_ID &&
        this.TEXTBOOKS_FOLDER_ID !== 'YOUR_TEXTBOOKS_FOLDER_ID'
      );
    },
    
    getCacheTTL: function() {
      return this.CACHE_TTL_HOURS * 60 * 60 * 1000;
    },
    
    showConfigError: function() {
      if (!this.isConfigured()) {
        var banner = document.createElement('div');
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:16px 20px;text-align:center;z-index:99999;font-family:system-ui;font-size:14px;';
        banner.innerHTML = '<strong>Setup Required:</strong> Edit js/config.js and replace the placeholder values with your Google Drive API key and folder IDs.';
        document.body.prepend(banner);
        return true;
      }
      return false;
    }
  };

})();
