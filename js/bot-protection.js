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
 * @returns {boolean} True if bot detected
 */
function detectBot() {
  var botDetected = false;
  
  // Check 1: Headless Chrome
  // Headless browsers often identify themselves
  if (/HeadlessChrome/i.test(navigator.userAgent)) {
    botDetected = true;
  }
  
  // Check 2: PhantomJS
  // PhantomJS is a common headless testing tool
  if (/PhantomJS/i.test(navigator.userAgent)) {
    botDetected = true;
  }
  
  // Check 3: WebDriver flag
  // Selenium and similar tools set this flag
  if (navigator.webdriver) {
    botDetected = true;
  }
  
  // Check 4: PhantomJS specific properties
  if (window.callPhantom || window._phantom) {
    botDetected = true;
  }
  
  // Check 5: Nightmare.js
  if (window.__nightmare) {
    botDetected = true;
  }
  
  // Check 6: Chrome automation
  if (window.domAutomation || window.domAutomationController) {
    botDetected = true;
  }
  
  return botDetected;
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
