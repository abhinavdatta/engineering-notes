/**
 * ============================================================
 * LOGGER.JS - Debug Logging Utility
 * ============================================================
 *
 * This utility provides controlled logging that only outputs in
 * development environments or when explicitly enabled.
 *
 * USAGE:
 * 1. Include logger.js BEFORE any other JS files that use logging
 * 2. Replace console.log with Logger.log throughout your code
 * 3. Replace console.error with Logger.error throughout your code
 * 4. Replace console.warn with Logger.warn throughout your code
 *
 * DEBUG MODE:
 * - Automatic: Enabled when hostname is 'localhost' or '127.0.0.1'
 * - Manual: Set window.DEBUG = true to enable on any domain
 * - Production: Disabled by default (no console output)
 *
 * MIGRATION:
 * - Find and replace: console.log → Logger.log
 * - Find and replace: console.error → Logger.error
 * - Find and replace: console.warn → Logger.warn
 * ============================================================
 */

(function() {
  'use strict';

  /**
   * Checks if debug mode is enabled
   * @returns {boolean} True if debug logging is enabled
   */
  function isDebugMode() {
    // Enable on localhost or 127.0.0.1
    if (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '3000') {
      return true;
    }

    // Enable if explicitly set
    if (window.DEBUG === true) {
      return true;
    }

    // Check for debug flag in URL
    if (window.location.search.includes('debug=1')) {
      return true;
    }

    return false;
  }

  /**
   * Safe logging function that only outputs in debug mode
   * @param {...any} args - Arguments to log
   */
  function log() {
    if (isDebugMode()) {
      console.log.apply(console, arguments);
    }
  }

  /**
   * Safe error logging function that only outputs in debug mode
   * @param {...any} args - Arguments to log
   */
  function error() {
    if (isDebugMode()) {
      console.error.apply(console, arguments);
    }
  }

  /**
   * Safe warn logging function that only outputs in debug mode
   * @param {...any} args - Arguments to log
   */
  function warn() {
    if (isDebugMode()) {
      console.warn.apply(console, arguments);
    }
  }

  /**
   * Safe info logging function that only outputs in debug mode
   * @param {...any} args - Arguments to log
   */
  function info() {
    if (isDebugMode()) {
      console.info.apply(console, arguments);
    }
  }

  /**
   * Safe debug logging function that only outputs in debug mode
   * @param {...any} args - Arguments to log
   */
  function debug() {
    if (isDebugMode()) {
      console.debug.apply(console, arguments);
    }
  }

  /**
   * Group logging function (for grouping related logs)
   * @param {string} label - Group label
   * @param {Function} fn - Function containing grouped logs
   */
  function group(label, fn) {
    if (isDebugMode()) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  }

  /**
   * Time tracking function (for performance measurement)
   * @param {string} label - Timer label
   */
  function time(label) {
    if (isDebugMode()) {
      console.time(label);
    }
  }

  /**
   * Time end function (for performance measurement)
   * @param {string} label - Timer label
   */
  function timeEnd(label) {
    if (isDebugMode()) {
      console.timeEnd(label);
    }
  }

  /**
   * Table logging function (for displaying tabular data)
   * @param {Array|Object} data - Data to display as table
   */
  function table(data) {
    if (isDebugMode()) {
      console.table(data);
    }
  }

  // Export Logger object to window
  window.Logger = {
    log: log,
    error: error,
    warn: warn,
    info: info,
    debug: debug,
    group: group,
    time: time,
    timeEnd: timeEnd,
    table: table,
    isDebugMode: isDebugMode
  };

  // Log initialization status (only in debug mode)
  if (isDebugMode()) {
    console.log('[Logger] Debug mode enabled');
  }

})();