/**
 * ============================================================
 * ADBLOCK-DETECTOR.JS - Non-Intrusive Ad Block Detection
 * ============================================================
 * 
 * Based on: https://github.com/OddDevelopment/Simple-Adblock-Detector
 * Modified to show a closable popup instead of redirecting.
 * 
 * HOW IT WORKS:
 * 1. Attempts to fetch known ad-related URLs
 * 2. Checks if ad-related DOM elements are hidden
 * 3. If adblock detected, shows a friendly popup
 * 4. User can close the popup and continue browsing
 * 
 * LINE REFERENCE:
 * - Lines 1-40:    File documentation
 * - Lines 41-80:   Fetch-based detection methods
 * - Lines 81-120:  DOM-based detection
 * - Lines 121-160: Main detection function
 * - Lines 161-200: Popup display logic
 * ============================================================
 */

/* ============================================================
   FETCH-BASED DETECTION METHODS
   ============================================================
   Try to fetch URLs that are commonly blocked by ad blockers.
   If fetch fails, it's likely an ad blocker is active.
   ============================================================ */

/**
 * Checks if Outbrain ad script is blocked
 * @returns {Promise<boolean>} True if blocked
 */
var outbrainErrorCheck = async function() {
  try {
    await fetch("https://widgets.outbrain.com/outbrain.js");
    return false;
  } catch (e) {
    return true;
  }
};

/**
 * Checks if AdLigature is blocked
 * @returns {Promise<boolean>} True if blocked
 */
var adligatureErrorCheck = async function() {
  try {
    await fetch("https://adligature.com/", { mode: "no-cors" });
    return false;
  } catch (e) {
    return true;
  }
};

/**
 * Checks if Quantserve is blocked
 * @returns {Promise<boolean>} True if blocked
 */
var quantserveErrorCheck = async function() {
  try {
    await fetch("https://secure.quantserve.com/quant.js", { mode: "no-cors" });
    return false;
  } catch (e) {
    return true;
  }
};

/**
 * Checks if adligature CSS is blocked
 * @returns {Promise<boolean>} True if blocked
 */
var adligatureCssErrorCheck = async function() {
  try {
    await fetch("https://cdn.adligature.com/work.ink/prod/rules.css", { mode: "no-cors" });
    return false;
  } catch (e) {
    return true;
  }
};

/**
 * Checks if srvtrack CSS is blocked
 * @returns {Promise<boolean>} True if blocked
 */
var srvtrackErrorCheck = async function() {
  try {
    await fetch("https://srvtrck.com/assets/css/LineIcons.css", { mode: "no-cors" });
    return false;
  } catch (e) {
    return true;
  }
};

/* ============================================================
   INTERVAL CHECK
   ============================================================
   Checks if setInterval is being tampered with.
   Some ad blockers modify JavaScript timers.
   ============================================================ */

/**
 * Checks if setInterval is working normally
 * @returns {Promise<boolean>} True if tampered
 */
var setIntervalCheck = function() {
  return new Promise(function(resolve) {
    var timeout = setTimeout(function() {
      resolve(true);
    }, 2000);

    var interval = setInterval(function() {
      var test = "a0b";
      if (test === "a0b") {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(false);
      }
    }, 100);
  });
};

/* ============================================================
   DOM-BASED DETECTION
   ============================================================
   Creates bait elements with common ad-related IDs.
   If they're hidden or removed, ad blocker is active.
   ============================================================ */

/**
 * Checks if ad bait elements are hidden
 * @returns {Promise<boolean>} True if ad blocker detected
 */
var idCheck = async function() {
  var bannerIds = ['AdHeader', 'AdContainer', 'AD_Top', 'homead', 'ad-lead'];
  var bannerString = bannerIds.map(function(bannerId) {
    return '<div id="' + bannerId + '">&nbsp;</div>';
  }).join('');
  
  var dataContainer = document.createElement("div");
  dataContainer.innerHTML = bannerString;
  dataContainer.style.cssText = 'position:absolute;left:-9999px;';
  document.body.appendChild(dataContainer);

  var adblocker = false;
  bannerIds.forEach(function(id) {
    var elem = document.getElementById(id);
    if (!elem || elem.offsetHeight === 0) {
      adblocker = true;
    }
  });

  dataContainer.remove();
  return adblocker;
};

/* ============================================================
   MAIN DETECTION FUNCTION
   ============================================================ */

/**
 * Main function that detects if ad blocker is active
 * @returns {Promise<boolean>} True if ad blocker detected
 */
var detectAdblock = async function() {
  // Run all detection methods in parallel
  var results = await Promise.all([
    outbrainErrorCheck(),
    adligatureErrorCheck(),
    quantserveErrorCheck(),
    adligatureCssErrorCheck(),
    srvtrackErrorCheck(),
    setIntervalCheck(),
    idCheck()
  ]);

  // If any method detected ad blocker, return true
  var hasAdblocker = results.some(function(r) {
    return r === true;
  });

  return hasAdblocker;
};

/* ============================================================
   POPUP DISPLAY LOGIC
   ============================================================
   Shows a friendly, closable popup when adblock is detected.
   User can dismiss it and continue browsing.
   ============================================================ */

/**
 * Shows the adblock popup
 */
var showAdblockPopup = function() {
  // Check if popup was already dismissed
  if (localStorage.getItem('engnotes-adblock-dismissed')) {
    return;
  }

  // Create popup element
  var popup = document.createElement('div');
  popup.id = 'adblock-popup';
  popup.innerHTML = [
    '<div class="adblock-overlay"></div>',
    '<div class="adblock-modal">',
    '  <button class="adblock-close" onclick="closeAdblockPopup()" title="Close">×</button>',
    '  <div class="adblock-icon">🛡️</div>',
    '  <h3 class="adblock-title">Ad Blocker Detected</h3>',
    '  <p class="adblock-text">',
    '    Please disable the adblocker so I can keep the website free.',
    '  </p>',
    '  <p class="adblock-text" style="font-size:13px;opacity:0.8;">',
    '    Ads help support this project and keep resources free for everyone.',
    '  </p>',
    '  <div class="adblock-buttons">',
    '    <button class="adblock-btn adblock-btn-primary" onclick="closeAdblockPopup()">Got it</button>',
    '    <button class="adblock-btn adblock-btn-secondary" onclick="dismissAdblockPopup()">Don\'t show again</button>',
    '  </div>',
    '  <div class="adblock-credit">',
    '    <a href="https://github.com/OddDevelopment/Simple-Adblock-Detector" target="_blank" rel="noopener">',
    '      Adblock detection by Simple-Adblock-Detector',
    '    </a>',
    '  </div>',
    '</div>'
  ].join('');

  document.body.appendChild(popup);
};

/**
 * Closes the popup for this session
 */
var closeAdblockPopup = function() {
  var popup = document.getElementById('adblock-popup');
  if (popup) {
    popup.classList.add('adblock-hiding');
    setTimeout(function() {
      popup.remove();
    }, 300);
  }
};

/**
 * Dismisses popup permanently (stored in localStorage)
 */
var dismissAdblockPopup = function() {
  localStorage.setItem('engnotes-adblock-dismissed', 'true');
  closeAdblockPopup();
};

/* ============================================================
   INITIALIZATION
   ============================================================
   Run detection after page loads. Show popup if adblock detected.
   ============================================================ */
(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdblockDetection);
  } else {
    initAdblockDetection();
  }
})();

/**
 * Initializes adblock detection
 */
function initAdblockDetection() {
  // Delay slightly to let ad blockers do their work
  setTimeout(function() {
    detectAdblock().then(function(detected) {
      if (detected) {
        console.log('Ad blocker detected');
        showAdblockPopup();
      }
    });
  }, 1000);
}
