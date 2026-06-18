/**
 * ============================================================
 * CONFIG.JS - Site Configuration
 * ============================================================
 *
 * This file contains your folder IDs and settings.
 *
 * Configuration required:
 * - NOTES_FOLDER_ID: Google Drive folder ID for notes
 * - TEXTBOOKS_FOLDER_ID: Google Drive folder ID for textbooks
 * - CONTACT_EMAIL: Your contact email
 * ============================================================
 */

(function() {
  'use strict';

  // Configuration - Edit these values for your site
  window.CONFIG = {
    // Google Drive Folder IDs
    NOTES_FOLDER_ID: '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG',
    TEXTBOOKS_FOLDER_ID: '1qdcMtjkSDhOFolDIHB6lLi6dK57ZTlmi',
    
    // Contact Email
    CONTACT_EMAIL: 'mailtest65066@gmail.com',
    
    // Cache Duration (hours)
    CACHE_TTL_HOURS: 24,
    
    // Feature Flags
    ENABLE_ANALYTICS: false,
    ENABLE_ADS: true,
    
    // Helper functions
    isConfigured: function() {
      return !!(this.NOTES_FOLDER_ID && this.TEXTBOOKS_FOLDER_ID);
    },
    
    getCacheTTL: function() {
      return this.CACHE_TTL_HOURS * 60 * 60 * 1000;
    }
  };

  // Log status (remove in production if desired)
  console.log('[Config] Configuration loaded:', {
    hasNotesId: !!window.CONFIG.NOTES_FOLDER_ID,
    hasTextbooksId: !!window.CONFIG.TEXTBOOKS_FOLDER_ID,
    hasEmail: !!window.CONFIG.CONTACT_EMAIL
  });

})();
