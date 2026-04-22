/**
 * ============================================================
 * HOME-APP.JS - Home Page Application Module
 * ============================================================
 * 
 * This module is specific to the index.html home page.
 * Handles particle animation and smart navigation.
 * 
 * DEPENDENCIES:
 * - theme-manager.js
 * 
 * FUNCTIONS:
 * - createParticles()   : Create floating background particles
 * - navigateTo(path)    : Smart navigation with port handling
 * 
 * LINE REFERENCE:
 * - Lines 1-30:    File documentation
 * - Lines 31-60:   Particle creation
 * - Lines 61-90:   Navigation function
 * - Lines 91-100:  Auto-initialization
 * ============================================================
 */

/* ============================================================
   PARTICLE CREATION
   ============================================================ */

/**
 * Creates floating particles for animated background
 * Particles float upward with random delays and durations
 */
function createParticles() {
  var container = document.getElementById('particles');
  
  // Create 30 particles
  for (var i = 0; i < 30; i++) {
    var particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random horizontal position
    particle.style.left = Math.random() * 100 + '%';
    
    // Random animation delay (staggered start)
    particle.style.animationDelay = Math.random() * 15 + 's';
    
    // Random animation duration (10-30 seconds)
    particle.style.animationDuration = (10 + Math.random() * 20) + 's';
    
    container.appendChild(particle);
  }
}

/* ============================================================
   NAVIGATION FUNCTION
   ============================================================ */

/**
 * Smart navigation that handles port transformation
 * Preserves XTransformPort query parameter if present
 * 
 * @param {string} path - Relative path to navigate to
 * 
 * @example
 * navigateTo('pages/notes.html');
 * navigateTo('pages/textbooks.html');
 */
function navigateTo(path) {
  var urlParams = new URLSearchParams(window.location.search);
  var transformPort = urlParams.get('XTransformPort');
  
  if (transformPort) {
    // Preserve port parameter for local development
    var separator = path.includes('?') ? '&' : '?';
    window.location.href = path + separator + 'XTransformPort=' + transformPort;
  } else {
    // Normal navigation for production
    window.location.href = path;
  }
}

/* ============================================================
   AUTO-INITIALIZATION
   ============================================================ */
(function() {
  // Create particles on load
  createParticles();
})();
