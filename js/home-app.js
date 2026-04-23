/**
 * ============================================================
 * HOME-APP.JS - Home Page Application Module
 * ============================================================
 * 
 * This module creates a beautiful starry night sky background
 * with twinkling stars and interactive mouse trail effect.
 * 
 * DEPENDENCIES:
 * - theme-manager.js
 * 
 * FEATURES:
 * - Animated stars moving upward
 * - Mouse trail with connected dots
 * - Color-changing filter overlay (CSS)
 * - Landscape silhouette (CSS)
 * ============================================================
 */

/* ============================================================
   CANVAS SETUP
   ============================================================ */
var canvas = document.getElementById('stars-canvas');
var ctx = canvas.getContext('2d');
var WIDTH, HEIGHT;

/* ============================================================
   CONFIGURATION
   ============================================================ */
var params = {
  maxDistFromCursor: 50,
  dotsSpeed: 0,
  backgroundSpeed: 0
};

/* ============================================================
   STATE VARIABLES
   ============================================================ */
var mouseMoving = false;
var mouseMoveChecker;
var mouseX, mouseY;
var stars = [];
var dots = [];
var initStarsPopulation = 100;
var dotsMinDist = 2;

/* ============================================================
   STAR CLASS
   ============================================================ */
function Star(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = Math.floor(Math.random() * 2) + 1;
  this.twinkleSpeed = Math.random() * 0.02 + 0.01;
  this.twinklePhase = Math.random() * Math.PI * 2;
  this.baseAlpha = Math.random() * 0.5 + 0.3;
  this.color = this.getColor();
}

Star.prototype.getColor = function() {
  var colors = [
    'rgba(255, 255, 255,',
    'rgba(200, 220, 255,',
    'rgba(255, 240, 220,',
    'rgba(220, 240, 255,'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

Star.prototype.draw = function() {
  var twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
  var alpha = this.baseAlpha * twinkle;
  
  ctx.fillStyle = this.color + alpha + ')';
  ctx.shadowBlur = this.r * 3;
  ctx.shadowColor = this.color + '0.5)';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
  
  this.twinklePhase += this.twinkleSpeed;
};

Star.prototype.move = function() {
  this.y -= 0.15 + params.backgroundSpeed / 100;
  if (this.y <= -10) {
    this.y = HEIGHT + 10;
    this.x = Math.floor(Math.random() * WIDTH);
  }
  this.draw();
};

/* ============================================================
   DOT CLASS (Mouse Trail)
   ============================================================ */
function Dot(id, x, y, r) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = Math.floor(Math.random() * 4) + 2;
  this.maxLinks = 2;
  this.speed = 0.5;
  this.a = 0.8;
  this.aReduction = 0.008;
  this.color = 'rgba(0, 217, 255, ' + this.a + ')';
  this.linkColor = 'rgba(0, 255, 200, ' + this.a / 3 + ')';
  this.dir = Math.floor(Math.random() * 140) + 200;
}

Dot.prototype.draw = function() {
  ctx.fillStyle = this.color;
  ctx.shadowBlur = this.r * 4;
  ctx.shadowColor = 'rgba(0, 217, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
  ctx.closePath();
  ctx.fill();
};

Dot.prototype.link = function() {
  if (this.id == 0) return;
  var previousDot1 = getPreviousDot(this.id, 1);
  var previousDot2 = getPreviousDot(this.id, 2);
  var previousDot3 = getPreviousDot(this.id, 3);
  if (!previousDot1) return;
  
  ctx.strokeStyle = this.linkColor;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 5;
  ctx.shadowColor = 'rgba(0, 255, 200, 0.3)';
  ctx.beginPath();
  ctx.moveTo(previousDot1.x, previousDot1.y);
  ctx.lineTo(this.x, this.y);
  if (previousDot2 != false) ctx.lineTo(previousDot2.x, previousDot2.y);
  if (previousDot3 != false) ctx.lineTo(previousDot3.x, previousDot3.y);
  ctx.stroke();
  ctx.closePath();
};

function getPreviousDot(id, stepback) {
  if (id == 0 || id - stepback < 0) return false;
  if (typeof dots[id - stepback] != 'undefined') return dots[id - stepback];
  else return false;
}

Dot.prototype.move = function() {
  this.a -= this.aReduction;
  if (this.a <= 0) {
    this.die();
    return;
  }
  this.color = 'rgba(0, 217, 255, ' + this.a + ')';
  this.linkColor = 'rgba(0, 255, 200, ' + this.a / 3 + ')';
  this.x = this.x + Math.cos(degToRad(this.dir)) * (this.speed + params.dotsSpeed / 100);
  this.y = this.y + Math.sin(degToRad(this.dir)) * (this.speed + params.dotsSpeed / 100);

  this.draw();
  this.link();
};

Dot.prototype.die = function() {
  dots[this.id] = null;
  delete dots[this.id];
};

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function setCanvasSize() {
  WIDTH = document.documentElement.clientWidth;
  HEIGHT = document.documentElement.clientHeight;

  canvas.setAttribute('width', WIDTH);
  canvas.setAttribute('height', HEIGHT);
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
function init() {
  ctx.strokeStyle = 'white';
  ctx.shadowColor = 'white';
  
  for (var i = 0; i < initStarsPopulation; i++) {
    stars[i] = new Star(i, Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT));
  }
  
  ctx.shadowBlur = 0;
  animate();
}

/* ============================================================
   ANIMATION LOOP
   ============================================================ */
function animate() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw stars
  for (var i in stars) {
    stars[i].move();
  }
  
  // Draw mouse trail dots
  for (var i in dots) {
    dots[i].move();
  }
  
  drawIfMouseMoving();
  requestAnimationFrame(animate);
}

/* ============================================================
   MOUSE HANDLING
   ============================================================ */
window.onmousemove = function(e) {
  mouseMoving = true;
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  clearInterval(mouseMoveChecker);
  mouseMoveChecker = setTimeout(function() {
    mouseMoving = false;
  }, 100);
};

function drawIfMouseMoving() {
  if (!mouseMoving) return;

  if (dots.length == 0) {
    dots[0] = new Dot(0, mouseX, mouseY);
    dots[0].draw();
    return;
  }

  var previousDot = getPreviousDot(dots.length, 1);
  var prevX = previousDot.x;
  var prevY = previousDot.y;

  var diffX = Math.abs(prevX - mouseX);
  var diffY = Math.abs(prevY - mouseY);

  if (diffX < dotsMinDist || diffY < dotsMinDist) return;

  var xVariation = Math.random() > 0.5 ? -1 : 1;
  xVariation = xVariation * Math.floor(Math.random() * params.maxDistFromCursor) + 1;
  var yVariation = Math.random() > 0.5 ? -1 : 1;
  yVariation = yVariation * Math.floor(Math.random() * params.maxDistFromCursor) + 1;
  
  dots[dots.length] = new Dot(dots.length, mouseX + xVariation, mouseY + yVariation);
  dots[dots.length - 1].draw();
  dots[dots.length - 1].link();
}

/* ============================================================
   RESIZE HANDLING
   ============================================================ */
window.onresize = function() {
  setCanvasSize();
};

/* ============================================================
   NAVIGATION FUNCTION
   ============================================================ */
function navigateTo(path) {
  var urlParams = new URLSearchParams(window.location.search);
  var transformPort = urlParams.get('XTransformPort');

  if (transformPort) {
    var separator = path.includes('?') ? '&' : '?';
    window.location.href = path + separator + 'XTransformPort=' + transformPort;
  } else {
    window.location.href = path;
  }
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function toggleMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

/* ============================================================
   START
   ============================================================ */
setCanvasSize();
init();
