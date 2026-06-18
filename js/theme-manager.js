/**
 * ============================================================
 * THEME-MANAGER.JS - Theme Switching Module
 * ============================================================
 * 
 * This module handles theme switching between:
 * - Light Mode (default)
 * - Dark Mode (slate colors)
 * - Pure Black Mode (AMOLED optimized)
 * 
 * USAGE:
 * 1. Include this script before other scripts
 * 2. Call setTheme('light'|'dark'|'pure-black') to change theme
 * 3. Theme is automatically saved to localStorage
 * 
 * FUNCTIONS:
 * - setTheme(theme)    : Set the current theme
 * - getTheme()         : Get current theme name
 * - initTheme()        : Initialize from localStorage
 * 
 * LINE REFERENCE:
 * - Lines 1-35:    File documentation
 * - Lines 36-60:   Theme constants and state
 * - Lines 61-90:   setTheme function
 * - Lines 91-110:  getTheme function
 * - Lines 111-130: initTheme function
 * - Lines 131-140: Auto-initialization
 * ============================================================
 */

/* ============================================================
   THEME CONSTANTS AND STATE
   ============================================================ */

/**
 * Available theme options
 * @constant {Object}
 */
var THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  PURE_BLACK: 'pure-black'
};

/**
 * LocalStorage key for saving theme preference
 * @constant {string}
 */
var THEME_STORAGE_KEY = 'engnotes-theme';

/**
 * Current active theme
 * @type {string}
 */
var currentTheme = THEME_OPTIONS.LIGHT;

/* ============================================================
   SET THEME FUNCTION
   ============================================================ */

/**
 * Sets the theme and updates the UI
 * 
 * @param {string} theme - Theme name: 'light', 'dark', or 'pure-black'
 * @returns {void}
 * 
 * @example
 * setTheme('dark');  // Switch to dark mode
 * setTheme('pure-black');  // Switch to AMOLED mode
 */
function setTheme(theme) {
  // Validate theme parameter
  if (theme !== THEME_OPTIONS.LIGHT && 
      theme !== THEME_OPTIONS.DARK && 
      theme !== THEME_OPTIONS.PURE_BLACK) {
    console.warn('Invalid theme:', theme, '. Using default.');
    theme = THEME_OPTIONS.LIGHT;
  }
  
  // Update data attribute on HTML element
  document.documentElement.setAttribute('data-theme', theme);
  
  // Save to localStorage for persistence
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  
  // Update current theme state
  currentTheme = theme;
  
  // Update theme buttons UI
  updateThemeButtons(theme);
  
  // Log theme change (for debugging)
  console.log('Theme changed to:', theme);
}

/* ============================================================
   UPDATE THEME BUTTONS FUNCTION
   ============================================================ */

/**
 * Updates the active state of theme buttons in the UI
 * 
 * @param {string} activeTheme - The currently active theme
 * @returns {void}
 */
function updateThemeButtons(activeTheme) {
  // Find all theme buttons
  var themeButtons = document.querySelectorAll('.theme-switch-btn');

  // Update each button's active state
  themeButtons.forEach(function(btn) {
    var btnTheme = btn.getAttribute('data-theme');

    if (btnTheme === activeTheme) {
      // Add active class to matching button
      btn.classList.add('active');
    } else {
      // Remove active class from non-matching buttons
      btn.classList.remove('active');
    }
  });
}

/* ============================================================
   GET THEME FUNCTION
   ============================================================ */

/**
 * Gets the current theme name
 * 
 * @returns {string} Current theme name
 * 
 * @example
 * var theme = getTheme();  // Returns 'light', 'dark', or 'pure-black'
 */
function getTheme() {
  return currentTheme;
}

/* ============================================================
   INITIALIZE THEME FUNCTION
   ============================================================ */

/**
 * Initializes theme from localStorage or defaults to light
 * Called automatically on page load
 * 
 * @returns {void}
 */
function initTheme() {
  // Try to get saved theme from localStorage
  var savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  
  // If no saved theme, check system preference
  if (!savedTheme) {
    // Check if user prefers dark mode at system level
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      savedTheme = THEME_OPTIONS.DARK;
    } else {
      savedTheme = THEME_OPTIONS.LIGHT;
    }
  }
  
  // Apply the theme
  setTheme(savedTheme);
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually set a preference
      var userPreference = localStorage.getItem(THEME_STORAGE_KEY);
      if (!userPreference) {
        setTheme(e.matches ? THEME_OPTIONS.DARK : THEME_OPTIONS.LIGHT);
      }
    });
  }
}

/* ============================================================
   AUTO-INITIALIZATION
   ============================================================
   Initialize theme immediately when script loads.
   This ensures theme is applied before page renders.
   ============================================================ */
(function() {
  // Run initialization
  initTheme();
})();
