/**
 * ============================================================
 * CONFIG.JS - Site Configuration (EXAMPLE)
 * ============================================================
 *
 * IMPORTANT: Do not use this file directly!
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to config.js
 * 2. Fill in your folder IDs
 * 3. Add config.js to .gitignore to keep your credentials private
 *
 * SECURITY NOTE:
 * - API key is now handled server-side by the Cloudflare Worker
 * - No API key is exposed to the client
 * - Only folder IDs are needed in client configuration
 *
 * CLOUDFLARE PAGES:
 * The Worker handles API key authentication via env.GOOGLE_DRIVE_API_KEY.
 * You only need to configure folder IDs in config.js:
 * - Set env.GOOGLE_DRIVE_API_KEY in Cloudflare Dashboard > Settings > Environment Variables
 * - NOTES_FOLDER_ID and TEXTBOOKS_FOLDER_ID can be in config.js or environment variables
 * ============================================================
 */

(function() {
  'use strict';

  // Configuration - Edit these values for your site
  window.CONFIG = {
    // Google Drive Folder IDs
    // Find folder ID in Google Drive URL: /drive/folders/THIS_IS_THE_ID
    NOTES_FOLDER_ID: 'YOUR_NOTES_FOLDER_ID',
    TEXTBOOKS_FOLDER_ID: 'YOUR_TEXTBOOKS_FOLDER_ID',

    // Contact Email
    CONTACT_EMAIL: 'your-email@example.com',

    // Cache Duration (hours)
    // How long to cache folder structure in localStorage
    CACHE_TTL_HOURS: 24,

    // Feature Flags
    ENABLE_ANALYTICS: false,
    ENABLE_ADS: true,

    // Helper functions
    isConfigured: function() {
      return !!(this.NOTES_FOLDER_ID &&
                this.NOTES_FOLDER_ID !== 'YOUR_NOTES_FOLDER_ID' &&
                this.TEXTBOOKS_FOLDER_ID &&
                this.TEXTBOOKS_FOLDER_ID !== 'YOUR_TEXTBOOKS_FOLDER_ID');
    },

    getCacheTTL: function() {
      return this.CACHE_TTL_HOURS * 60 * 60 * 1000;
    }
  };

  // Log status in development
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '3000') {
    console.log('[Config] Configuration loaded:', {
      isConfigured: window.CONFIG.isConfigured(),
      hasNotesId: !!window.CONFIG.NOTES_FOLDER_ID && window.CONFIG.NOTES_FOLDER_ID !== 'YOUR_NOTES_FOLDER_ID',
      hasTextbooksId: !!window.CONFIG.TEXTBOOKS_FOLDER_ID && window.CONFIG.TEXTBOOKS_FOLDER_ID !== 'YOUR_TEXTBOOKS_FOLDER_ID',
      hasEmail: !!window.CONFIG.CONTACT_EMAIL
    });

    if (!window.CONFIG.isConfigured()) {
      console.warn('[Config] ⚠️  Configuration incomplete! Please edit config.js with your folder IDs.');
    }
  }

})();