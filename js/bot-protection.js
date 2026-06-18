/**
 * ============================================================
 * BOT-PROTECTION.JS - Anti-Bot Detection Module
 * ============================================================
 * 
 * This module detects and blocks common bot/scraper tools:
 * - Headless Chrome
 * - PhantomJS
 * - Nightmare
 * - Selenium WebDriver
 * 
 * USAGE:
 * 1. Include this script at the end of the body
 * 2. Detection runs automatically on page load
 * 3. If bot detected, page content is replaced with warning
 * 
 * LINE REFERENCE:
 * - Lines 1-30:   File documentation
 * - Lines 31-60:  Detection logic
 * - Lines 61-80:  Block display
 * ============================================================
 */

/* ============================================================
   BOT DETECTION LOGIC
   ============================================================ */

/**
 * Checks various indicators of automated browsing
 * Enhanced with additional detection methods for better bot identification
 * @returns {boolean} True if bot detected
 */
function detectBot() {
  var botDetected = false;
  var suspectScore = 0; // Scoring system to reduce false positives

  // Check 1: Headless Chrome
  // Headless browsers often identify themselves
  if (/HeadlessChrome/i.test(navigator.userAgent)) {
    botDetected = true;
    suspectScore += 3;
  }

  // Check 2: PhantomJS
  // PhantomJS is a common headless testing tool
  if (/PhantomJS/i.test(navigator.userAgent)) {
    botDetected = true;
    suspectScore += 3;
  }

  // Check 3: WebDriver flag
  // Selenium and similar tools set this flag
  if (navigator.webdriver) {
    botDetected = true;
    suspectScore += 3;
  }

  // Check 4: PhantomJS specific properties
  if (window.callPhantom || window._phantom) {
    botDetected = true;
    suspectScore += 3;
  }

  // Check 5: Nightmare.js
  if (window.__nightmare) {
    botDetected = true;
    suspectScore += 3;
  }

  // Check 6: Chrome automation
  if (window.domAutomation || window.domAutomationController) {
    botDetected = true;
    suspectScore += 3;
  }

  /* ============================================================
     NEW: Enhanced Detection Methods
     ============================================================ */

  // Check 7: Missing or inconsistent navigator.plugins
  // Real browsers have plugins; headless browsers often don't
  if (typeof navigator.plugins !== 'undefined' && navigator.plugins.length === 0) {
    // But check if this is a browser that should have plugins
    // Chrome/Firefox/Safari should have at least some plugins
    var isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge|OPR/i.test(navigator.userAgent);
    var isFirefox = /Firefox/i.test(navigator.userAgent);
    if (isChrome || isFirefox) {
      suspectScore += 1;
    }
  }

  // Check 8: Missing or inconsistent navigator.languages
  // Real browsers have at least one language
  if (typeof navigator.languages === 'undefined' || navigator.languages.length === 0) {
    suspectScore += 1;
  } else if (navigator.languages.length === 1 && navigator.languages[0] !== navigator.language) {
    // Inconsistent language settings
    suspectScore += 1;
  }

  // Check 9: Unusual screen dimensions
  // Headless browsers often have 0x0 or unrealistic dimensions
  if (window.screen) {
    var screenWidth = window.screen.width || 0;
    var screenHeight = window.screen.height || 0;
    var screenAvailWidth = window.screen.availWidth || 0;
    var screenAvailHeight = window.screen.availHeight || 0;

    // Check for 0x0 dimensions
    if (screenWidth === 0 || screenHeight === 0 || screenAvailWidth === 0 || screenAvailHeight === 0) {
      suspectScore += 2;
    }

    // Check for extremely small screens (unlikely for real users)
    if (screenWidth < 100 || screenHeight < 100) {
      suspectScore += 2;
    }

    // Check if available screen is larger than total screen (impossible)
    if (screenAvailWidth > screenWidth || screenAvailHeight > screenHeight) {
      suspectScore += 2;
    }
  }

  // Check 10: Missing window.chrome on Chrome User Agent
  // Real Chrome always has window.chrome object
  var isChromeUA = /Chrome/i.test(navigator.userAgent) && !/Edge|OPR|Edg|Brave/i.test(navigator.userAgent);
  if (isChromeUA && typeof window.chrome !== 'object') {
    suspectScore += 1;
  }

  // Check 11: Timing-based detection
  // Headless browsers often have different rAF timing
  var timingScore = detectTimingAnomalies();
  suspectScore += timingScore;

  // Check 12: DevTools protocol detection
  // Some headless browsers expose devtools endpoints
  if (window.devtools || window.chrome && window.chrome.runtime && window.chrome.runtime.id) {
    suspectScore += 2;
  }

  // Check 13: Missing Permissions API (available in all modern browsers)
  if (typeof navigator.permissions === 'undefined') {
    suspectScore += 1;
  }

  // Check 14: Document has inconsistent property
  // Real browsers have certain document properties
  if (typeof document.documentMode === 'undefined' && typeof window.HTMLDocument !== 'undefined') {
    // Not IE, so should not have documentMode
    // This is normal for modern browsers, skip
  }

  // Check 15: WebGL fingerprinting
  // Headless browsers often have different WebGL characteristics
  var webglScore = detectWebglAnomalies();
  suspectScore += webglScore;

  // Convert score to boolean detection
  // Threshold of 4 or more indicates likely bot
  if (suspectScore >= 4) {
    botDetected = true;
  }

  return botDetected;
}

/**
 * Detects timing anomalies using requestAnimationFrame
 * Headless browsers often have inconsistent callback timing
 * @returns {number} Suspicion score (0-2)
 */
function detectTimingAnomalies() {
  var score = 0;
  var rafTiming = [];
  var start = performance.now();

  try {
    // Run several rAF callbacks and measure timing
    for (var i = 0; i < 5; i++) {
      var frameStart = performance.now();
      var frameEnd;

      (function(frameStart, i) {
        requestAnimationFrame(function(timestamp) {
          frameEnd = performance.now();
          rafTiming.push(frameEnd - frameStart);

          if (rafTiming.length === 5) {
            // Analyze timing patterns
            var avgTiming = rafTiming.reduce(function(a, b) { return a + b; }, 0) / rafTiming.length;

            // Extremely fast or slow timing is suspicious
            if (avgTiming < 2 || avgTiming > 50) {
              score += 1;
            }

            // Inconsistent timing (high variance)
            var variance = rafTiming.reduce(function(sum, val) {
              return sum + Math.pow(val - avgTiming, 2);
            }, 0) / rafTiming.length;

            if (variance > 100) {
              score += 1;
            }
          }
        });
      })(frameStart, i);
    }
  } catch (e) {
    // If rAF fails, that's also suspicious
    score = 1;
  }

  return score;
}

/**
 * Detects WebGL anomalies common in headless browsers
 * @returns {number} Suspicion score (0-2)
 */
function detectWebglAnomalies() {
  var score = 0;

  try {
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      // Get debug info
      var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      if (debugInfo) {
        var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        // Headless browsers often have "Google SwiftShader" or generic renderer
        if (/SwiftShader|Google Offscreen/i.test(renderer)) {
          score += 1;
        }

        // Missing or generic renderer info
        if (!renderer || !vendor || renderer.length < 5 || vendor.length < 5) {
          score += 1;
        }
      } else {
        // Missing debug info extension is suspicious
        score += 1;
      }
    } else {
      // No WebGL support at all (suspicious for modern browsers)
      score += 1;
    }
  } catch (e) {
    // WebGL errors - could be privacy extension or headless
    // Don't penalize too heavily as privacy extensions are common
    score = 0;
  }

  return score;
}

/* ============================================================
   BLOCK DISPLAY
   ============================================================ */

/**
 * Displays a bot warning message and blocks content
 */
function showBotWarning() {
  // Create styled warning message
  var warningHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:#fff;font-family:Arial;text-align:center;">';
  warningHTML += '<div>';
  warningHTML += '<h1>🤖 Bot Detected</h1>';
  warningHTML += '<p style="margin-top:20px;font-size:18px;">This website is protected against automated scraping.</p>';
  warningHTML += '</div></div>';
  
  // Replace page content
  document.body.innerHTML = warningHTML;
}

/* ============================================================
   AUTO-EXECUTION
   ============================================================
   Run bot detection immediately when script loads.
   Note: Disabled in development/sandbox environments
   ============================================================ */
(function() {
  // Skip bot detection in development or if skip flag is set
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('skipbot=1') ||
      window.location.port === '3000') {
    console.log('[BotProtection] Skipped in development mode');
    return;
  }
  
  if (detectBot()) {
    showBotWarning();
  }
})();
