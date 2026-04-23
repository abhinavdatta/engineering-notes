/**
 * ============================================================
 * COOKIE-CONSENT.JS - Cookie Consent Management Module
 * ============================================================
 * 
 * This module handles cookie consent for localStorage caching:
 * - Shows consent banner on first visit
 * - Stores user preference in localStorage
 * - Enables/disables caching based on consent
 * - Provides cache management functions
 * 
 * USAGE:
 * 1. Include this script after theme-manager.js
 * 2. Call initCookieConsent() to check and show banner
 * 3. Use hasCookieConsent() to check if caching is allowed
 * 4. Use cacheManager for all cache operations
 * 
 * FUNCTIONS:
 * - initCookieConsent()     : Initialize and show banner if needed
 * - hasCookieConsent()      : Returns true if user accepted cookies
 * - acceptCookies()         : Called when user accepts
 * - declineCookies()        : Called when user declines
 * - resetCookieConsent()    : Reset consent (show banner again)
 * 
 * CACHE MANAGER:
 * - cacheManager.set(key, value)    : Store data (if consent)
 * - cacheManager.get(key)           : Retrieve data
 * - cacheManager.remove(key)        : Remove specific item
 * - cacheManager.clear()            : Clear all cached data
 * - cacheManager.isAvailable()      : Check if caching is enabled
 * ============================================================
 */

/* ============================================================
   CONSENT STATE CONSTANTS
   ============================================================ */

/**
 * LocalStorage key for storing consent preference
 * @constant {string}
 */
var CONSENT_KEY = 'enginotes_cookie_consent';

/**
 * LocalStorage key prefix for cached data
 * @constant {string}
 */
var CACHE_PREFIX = 'enginotes_cache_';

/**
 * Consent values
 * @constant {Object}
 */
var CONSENT_VALUES = {
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
};

/* ============================================================
   CORE CONSENT FUNCTIONS
   ============================================================ */

/**
 * Checks if user has given cookie consent
 * @returns {boolean} True if consent was given
 */
function hasCookieConsent() {
  var consent = localStorage.getItem(CONSENT_KEY);
  return consent === CONSENT_VALUES.ACCEPTED;
}

/**
 * Checks if user has made a consent choice (accepted or declined)
 * @returns {boolean} True if choice was made
 */
function hasConsentChoice() {
  var consent = localStorage.getItem(CONSENT_KEY);
  return consent === CONSENT_VALUES.ACCEPTED || consent === CONSENT_VALUES.DECLINED;
}

/**
 * Gets the current consent status
 * @returns {string|null} 'accepted', 'declined', or null
 */
function getConsentStatus() {
  return localStorage.getItem(CONSENT_KEY);
}

/* ============================================================
   CONSENT ACTIONS
   ============================================================ */

/**
 * Called when user accepts cookies
 * Enables localStorage caching
 */
function acceptCookies() {
  localStorage.setItem(CONSENT_KEY, CONSENT_VALUES.ACCEPTED);
  hideCookieBanner();
  updateCookieStatus();
  
  // Trigger event for other modules
  if (typeof window.onCookiesAccepted === 'function') {
    window.onCookiesAccepted();
  }
  
  console.log('[CookieConsent] Cookies accepted - caching enabled');
}

/**
 * Called when user declines cookies
 * Clears any existing cache and disables future caching
 */
function declineCookies() {
  localStorage.setItem(CONSENT_KEY, CONSENT_VALUES.DECLINED);
  hideCookieBanner();
  updateCookieStatus();
  
  // Clear any existing cache since user declined
  cacheManager.clear();
  
  // Trigger event for other modules
  if (typeof window.onCookiesDeclined === 'function') {
    window.onCookiesDeclined();
  }
  
  console.log('[CookieConsent] Cookies declined - caching disabled');
}

/**
 * Resets consent and shows banner again
 */
function resetCookieConsent() {
  localStorage.removeItem(CONSENT_KEY);
  cacheManager.clear();
  showCookieBanner();
  updateCookieStatus();
}

/* ============================================================
   BANNER DISPLAY FUNCTIONS
   ============================================================ */

/**
 * Shows the cookie consent banner with animation
 */
function showCookieBanner() {
  var banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.classList.remove('hidden');
    // Trigger animation after a small delay
    setTimeout(function() {
      banner.classList.add('show');
    }, 100);
  }
}

/**
 * Hides the cookie consent banner with animation
 */
function hideCookieBanner() {
  var banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.classList.remove('show');
    // Remove from DOM after animation
    setTimeout(function() {
      banner.classList.add('hidden');
    }, 300);
  }
}

/**
 * Updates the cookie status indicator in footer
 */
function updateCookieStatus() {
  var statusEl = document.getElementById('cookie-status');
  if (!statusEl) return;
  
  var consent = getConsentStatus();
  
  if (consent === CONSENT_VALUES.ACCEPTED) {
    statusEl.className = 'cookie-status accepted';
    statusEl.innerHTML = '<span class="cookie-status-icon">●</span> Caching enabled | <a onclick="resetCookieConsent()">Change</a>';
  } else if (consent === CONSENT_VALUES.DECLENSED) {
    statusEl.className = 'cookie-status declined';
    statusEl.innerHTML = '<span class="cookie-status-icon">●</span> Caching disabled | <a onclick="resetCookieConsent()">Change</a>';
  } else {
    statusEl.className = 'cookie-status';
    statusEl.innerHTML = '<span class="cookie-status-icon">●</span> No consent given';
  }
}

/* ============================================================
   CACHE MANAGER OBJECT
   ============================================================
   Provides safe caching that respects user consent
*/

var cacheManager = {
  /**
   * Stores data in cache (only if consent given)
   * @param {string} key - Cache key (without prefix)
   * @param {*} value - Data to store (will be JSON stringified)
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set: function(key, value, ttl) {
    if (!hasCookieConsent()) {
      console.log('[CacheManager] Skipping cache set - no consent');
      return false;
    }
    
    var cacheKey = CACHE_PREFIX + key;
    var data = {
      value: value,
      timestamp: Date.now(),
      ttl: ttl || null
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[CacheManager] Error setting cache:', e);
      return false;
    }
  },
  
  /**
   * Retrieves data from cache
   * @param {string} key - Cache key (without prefix)
   * @returns {*} Cached value or null if not found/expired
   */
  get: function(key) {
    if (!hasCookieConsent()) {
      return null;
    }
    
    var cacheKey = CACHE_PREFIX + key;
    
    try {
      var item = localStorage.getItem(cacheKey);
      if (!item) return null;
      
      var data = JSON.parse(item);
      
      // Check TTL expiration
      if (data.ttl && (Date.now() - data.timestamp) > data.ttl) {
        this.remove(key);
        return null;
      }
      
      return data.value;
    } catch (e) {
      console.error('[CacheManager] Error getting cache:', e);
      return null;
    }
  },
  
  /**
   * Removes a specific item from cache
   * @param {string} key - Cache key (without prefix)
   */
  remove: function(key) {
    var cacheKey = CACHE_PREFIX + key;
    localStorage.removeItem(cacheKey);
  },
  
  /**
   * Clears all cached data (only items with our prefix)
   */
  clear: function() {
    var keysToRemove = [];
    
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(function(key) {
      localStorage.removeItem(key);
    });
    
    console.log('[CacheManager] Cleared ' + keysToRemove.length + ' cached items');
  },
  
  /**
   * Checks if caching is available (consent given)
   * @returns {boolean}
   */
  isAvailable: function() {
    return hasCookieConsent();
  },
  
  /**
   * Gets cache statistics
   * @returns {Object} Stats object with count and size
   */
  getStats: function() {
    var count = 0;
    var size = 0;
    
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        count++;
        var item = localStorage.getItem(key);
        if (item) {
          size += item.length * 2; // Approximate size in bytes
        }
      }
    }
    
    return {
      itemCount: count,
      approximateSize: size,
      sizeFormatted: (size / 1024).toFixed(2) + ' KB'
    };
  }
};

/* ============================================================
   INITIALIZATION
   ============================================================ */

/**
 * Initializes cookie consent system
 * Shows banner if no choice has been made
 */
function initCookieConsent() {
  // Check if user has already made a choice
  var hasChoice = hasConsentChoice();
  
  if (!hasChoice) {
    // No choice made yet - show banner after a short delay
    setTimeout(showCookieBanner, 1000);
  }
  
  // Update status indicator
  updateCookieStatus();
  
  console.log('[CookieConsent] Initialized - Consent:', getConsentStatus() || 'pending');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
  // DOM already loaded
  setTimeout(initCookieConsent, 100);
}
