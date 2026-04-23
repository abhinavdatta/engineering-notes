/**
 * ============================================================
 * NAVIGATION.JS - Navigation and UI Module
 * ============================================================
 * 
 * This module handles all navigation and UI rendering:
 * - View switching (home, department, subject, unit, subfolder)
 * - Browser history management (back/forward buttons work correctly)
 * - Breadcrumb updates
 * - Navigation buttons
 * - Rendering functions for each view
 * ============================================================
 */

/* ============================================================
   STATE VARIABLES
   ============================================================ */

var currentDeptId = null;
var currentSubjectId = null;
var currentUnitId = null;
var currentSubfolderId = null;
var currentSemester = 'all';

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

function getDeptById(id) {
  return DATA.find(function(d) {
    return d.id === id;
  });
}

function getSubjectById(deptId, subjectId) {
  var dept = getDeptById(deptId);
  if (!dept) return null;
  
  for (var sem in dept.semesters) {
    var found = dept.semesters[sem].find(function(s) {
      return s.id === subjectId;
    });
    if (found) return found;
  }
  return null;
}

function getUnitById(deptId, subjectId, unitId) {
  var sub = getSubjectById(deptId, subjectId);
  if (!sub) return null;
  
  return sub.units.find(function(u) {
    return u.id === unitId;
  });
}

function getSemesterName(n) {
  var names = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  return names[n] || n + 'th';
}

function hideAllViews() {
  ['home-view', 'dept-view', 'subject-view', 'unit-view', 'subfolder-view'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

function toggleAds(show) {
  var adTop = document.getElementById('ad-top');
  var adInline = document.getElementById('ad-dept-inline');
  
  if (adTop) {
    adTop.style.display = show ? 'flex' : 'none';
  }
  if (adInline) {
    adInline.style.display = show ? 'flex' : 'none';
  }
}

/* ============================================================
   BROWSER HISTORY MANAGEMENT
   ============================================================ */

/**
 * Pushes current state to browser history
 */
function pushHistoryState() {
  var state = {
    deptId: currentDeptId,
    subjectId: currentSubjectId,
    unitId: currentUnitId,
    subfolderId: currentSubfolderId
  };
  
  // Build URL hash
  var hash = '';
  if (currentDeptId) hash += '/' + currentDeptId;
  if (currentSubjectId) hash += '/' + currentSubjectId;
  if (currentUnitId) hash += '/' + currentUnitId;
  if (currentSubfolderId) hash += '/sub/' + currentSubfolderId;
  
  history.pushState(state, '', hash ? '#' + hash : window.location.pathname);
}

/**
 * Restores view from history state
 */
function restoreFromState(state) {
  if (!state) {
    // No state, show home view
    currentDeptId = null;
    currentSubjectId = null;
    currentUnitId = null;
    currentSubfolderId = null;
    
    document.getElementById('home-view').classList.remove('hidden');
    toggleAds(false);
    updateBreadcrumb();
    updateDeptButtons();
    updateBackButton();
    return;
  }
  
  // Restore state variables
  currentDeptId = state.deptId || null;
  currentSubjectId = state.subjectId || null;
  currentUnitId = state.unitId || null;
  currentSubfolderId = state.subfolderId || null;
  
  // Restore the appropriate view
  hideAllViews();
  
  if (currentSubfolderId) {
    var subfolderView = document.getElementById('subfolder-view');
    if (subfolderView) {
      subfolderView.classList.remove('hidden');
    }
    toggleAds(true);
    updateBreadcrumb();
    updateBackButton();
    // Note: renderSubfolder is in page-specific JS
    if (typeof renderSubfolder === 'function') {
      renderSubfolder(currentSubfolderId, 'Folder');
    }
  } else if (currentUnitId) {
    document.getElementById('unit-view').classList.remove('hidden');
    toggleAds(true);
    updateBreadcrumb();
    updateBackButton();
    if (typeof renderUnit === 'function') {
      renderUnit();
    }
  } else if (currentSubjectId) {
    document.getElementById('subject-view').classList.remove('hidden');
    toggleAds(true);
    updateBreadcrumb();
    updateBackButton();
    renderSubject();
  } else if (currentDeptId) {
    document.getElementById('dept-view').classList.remove('hidden');
    toggleAds(true);
    updateBreadcrumb();
    updateDeptButtons();
    updateBackButton();
    renderDept();
  } else {
    document.getElementById('home-view').classList.remove('hidden');
    toggleAds(false);
    updateBreadcrumb();
    updateDeptButtons();
    updateBackButton();
  }
}

/**
 * Handle browser back/forward buttons
 */
window.addEventListener('popstate', function(e) {
  restoreFromState(e.state);
});

/**
 * Initialize state from URL hash on page load
 */
function initFromHash() {
  var hash = window.location.hash.slice(1); // Remove #
  if (!hash) return;
  
  var parts = hash.split('/');
  if (parts[0] === '') parts.shift(); // Remove empty first element
  
  if (parts.length >= 1 && parts[0]) {
    currentDeptId = parts[0];
    if (parts.length >= 2 && parts[1]) {
      currentSubjectId = parts[1];
      if (parts.length >= 3 && parts[2]) {
        if (parts[2] === 'sub' && parts[3]) {
          currentSubfolderId = parts[3];
        } else {
          currentUnitId = parts[2];
          if (parts.length >= 5 && parts[3] === 'sub' && parts[4]) {
            currentSubfolderId = parts[4];
          }
        }
      }
    }
  }
}

/* ============================================================
   NAVIGATION FUNCTIONS
   ============================================================ */

function goHome() {
  var p = new URLSearchParams(window.location.search).get('XTransformPort');
  window.location.href = p ? '../index.html?XTransformPort=' + p : 'https://your-domain.com';
}

function goToDept(id) {
  currentDeptId = id;
  currentSubjectId = null;
  currentUnitId = null;
  currentSubfolderId = null;
  currentSemester = 'all';
  
  hideAllViews();
  document.getElementById('dept-view').classList.remove('hidden');
  toggleAds(true);
  
  updateBreadcrumb();
  updateDeptButtons();
  updateBackButton();
  renderDept();
  
  pushHistoryState();
}

function goBackToDept() {
  if (currentDeptId) {
    goToDept(currentDeptId);
  } else {
    goHome();
  }
}

function goToSubject(id) {
  currentSubjectId = id;
  currentUnitId = null;
  currentSubfolderId = null;
  
  hideAllViews();
  document.getElementById('subject-view').classList.remove('hidden');
  toggleAds(true);
  
  updateBreadcrumb();
  updateBackButton();
  renderSubject();
  
  pushHistoryState();
}

function goBackToSubject() {
  if (currentSubjectId) {
    goToSubject(currentSubjectId);
  } else {
    goBackToDept();
  }
}

function goToUnit(id) {
  currentUnitId = id;
  currentSubfolderId = null;
  
  hideAllViews();
  document.getElementById('unit-view').classList.remove('hidden');
  toggleAds(true);
  
  updateBreadcrumb();
  updateBackButton();
  renderUnit();
  
  pushHistoryState();
}

function goBackToUnit() {
  if (currentUnitId) {
    goToUnit(currentUnitId);
  } else {
    goBackToSubject();
  }
}

function goToSubfolder(id, name) {
  currentSubfolderId = id;
  
  hideAllViews();
  var subfolderView = document.getElementById('subfolder-view');
  if (subfolderView) {
    subfolderView.classList.remove('hidden');
  } else {
    // Create subfolder view if it doesn't exist
    createSubfolderView();
    document.getElementById('subfolder-view').classList.remove('hidden');
  }
  toggleAds(true);
  
  updateBreadcrumb();
  updateBackButton();
  renderSubfolder(id, name);
  
  pushHistoryState();
}

function goBack() {
  if (currentSubfolderId) {
    goBackToUnit();
  } else if (currentUnitId) {
    goBackToSubject();
  } else if (currentSubjectId) {
    goBackToDept();
  } else if (currentDeptId) {
    goHome();
  }
}

/* ============================================================
   CREATE SUBFOLDER VIEW (dynamically if needed)
   ============================================================ */

function createSubfolderView() {
  var html = '<div id="subfolder-view" class="hidden">';
  html += '<div class="dept-header">';
  html += '<h1 class="dept-title" id="subfolder-title">Subfolder</h1>';
  html += '<p class="dept-info" id="subfolder-info">Files</p>';
  html += '</div>';
  html += '<div class="main" id="subfolder-content"></div>';
  html += '</div>';
  
  // Insert before footer
  var footer = document.querySelector('.footer');
  if (footer) {
    footer.insertAdjacentHTML('beforebegin', html);
  } else {
    document.body.insertAdjacentHTML('beforeend', html);
  }
}

/* ============================================================
   BREADCRUMB FUNCTIONS
   ============================================================ */

function updateBreadcrumb() {
  var html = '<a href="https://your-domain.com">Home</a> → <span>Class Resources</span>';
  
  if (currentDeptId) {
    var d = getDeptById(currentDeptId);
    if (d) {
      html += ' → <span>' + d.name + '</span>';
    }
  }
  
  if (currentSubjectId) {
    var s = getSubjectById(currentDeptId, currentSubjectId);
    if (s) {
      html += ' → <span>' + s.name + '</span>';
    }
  }
  
  if (currentUnitId) {
    var unit = getUnitById(currentDeptId, currentSubjectId, currentUnitId);
    if (unit) {
      html += ' → <span>' + unit.name + '</span>';
    }
  }
  
  if (currentSubfolderId && document.getElementById('subfolder-title')) {
    var subfolderName = document.getElementById('subfolder-title').textContent;
    if (subfolderName) {
      html += ' → <span>' + subfolderName + '</span>';
    }
  }
  
  // Update old breadcrumb (if exists)
  var breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = html;
  }
  
  // Update new navbar breadcrumb (if exists)
  var navbarBreadcrumb = document.getElementById('navbar-breadcrumb');
  if (navbarBreadcrumb) {
    // Simpler breadcrumb for navbar
    var navHtml = '<a href="https://your-domain.com">Home</a>';
    navHtml += '<span class="separator">→</span>';
    navHtml += '<span>Class Resources</span>';
    
    if (currentDeptId) {
      var d = getDeptById(currentDeptId);
      if (d) {
        navHtml += '<span class="separator">→</span>';
        navHtml += '<span>' + d.code + '</span>';
      }
    }
    
    if (currentSubjectId) {
      var s = getSubjectById(currentDeptId, currentSubjectId);
      if (s) {
        navHtml += '<span class="separator">→</span>';
        navHtml += '<span>' + s.code + '</span>';
      }
    }
    
    if (currentUnitId) {
      var unit = getUnitById(currentDeptId, currentSubjectId, currentUnitId);
      if (unit) {
        navHtml += '<span class="separator">→</span>';
        navHtml += '<span>Unit ' + unit.number + '</span>';
      }
    }
    
    navbarBreadcrumb.innerHTML = navHtml;
  }
}

function updateDeptButtons() {
  var html = '<span style="font-weight: 500; color: var(--text-secondary);">Departments: </span>';
  
  DATA.forEach(function(d) {
    var btnClass = d.id === currentDeptId ? 'dept-btn active' : 'dept-btn';
    html += '<button class="' + btnClass + '" onclick="goToDept(\'' + d.id + '\')">' + d.code + '</button> ';
  });
  
  document.getElementById('dept-links').innerHTML = html;
}

function updateBackButton() {
  var backBtn = document.getElementById('header-back-btn');
  
  // Check if back button exists on this page
  if (!backBtn) {
    return;
  }
  
  if (currentSubfolderId) {
    backBtn.style.display = 'inline-block';
    backBtn.onclick = goBackToUnit;
  } else if (currentUnitId) {
    backBtn.style.display = 'inline-block';
    backBtn.onclick = goBackToSubject;
  } else if (currentSubjectId) {
    backBtn.style.display = 'inline-block';
    backBtn.onclick = goBackToDept;
  } else if (currentDeptId) {
    backBtn.style.display = 'inline-block';
    backBtn.onclick = goHome;
  } else {
    backBtn.style.display = 'none';
  }
}

/* ============================================================
   RENDER FUNCTIONS
   ============================================================ */

function renderHome() {
  var html = '<h2 class="section-title">Choose Department</h2>';
  
  // Desktop table view
  html += '<div class="table-container"><table>';
  html += '<thead><tr><th>Code</th><th>Department</th><th>Action</th></tr></thead><tbody>';
  
  DATA.forEach(function(d) {
    html += '<tr>';
    html += '<td><span class="code-badge">' + d.code + '</span></td>';
    html += '<td style="font-weight:500;">' + d.name + '</td>';
    html += '<td><button class="view-btn" onclick="goToDept(\'' + d.id + '\')">View →</button></td>';
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  // Mobile card view
  html += '<div class="file-cards">';
  
  DATA.forEach(function(d) {
    html += '<div class="file-card" onclick="goToDept(\'' + d.id + '\')" style="cursor:pointer;">';
    html += '<div class="file-card-header">';
    html += '<div class="code-badge" style="flex-shrink:0;">' + d.code + '</div>';
    html += '<div class="file-card-info">';
    html += '<div class="file-card-name">' + d.name + '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  
  document.getElementById('home-content').innerHTML = html;
}

function renderDept() {
  var dept = getDeptById(currentDeptId);
  if (!dept) return;
  
  document.getElementById('dept-title').textContent = dept.name;
  
  var total = 0;
  for (var sem in dept.semesters) {
    total += dept.semesters[sem].length;
  }
  document.getElementById('dept-count').textContent = total + ' subjects';
  
  var semHtml = '<button class="filter-btn active" onclick="filterSem(\'all\',this)">All</button>';
  for (var s = 1; s <= 8; s++) {
    semHtml += '<button class="filter-btn" onclick="filterSem(' + s + ',this)">Sem ' + s + '</button>';
  }
  document.getElementById('semester-filters').innerHTML = semHtml;
  
  renderDeptTable();
}

function renderDeptTable() {
  var dept = getDeptById(currentDeptId);
  if (!dept) return;
  
  var html = '';
  var sems = Object.keys(dept.semesters).sort(function(a, b) {
    return a - b;
  });
  
  sems.forEach(function(sem) {
    var subs = dept.semesters[sem];
    
    if (currentSemester !== 'all' && sem != currentSemester) return;
    if (subs.length === 0) return;
    
    html += '<div style="margin-bottom:24px;">';
    html += '<h3 class="sem-title">' + getSemesterName(sem) + ' Semester (' + subs.length + ' subjects)</h3>';
    
    // Desktop table view
    html += '<div class="table-container"><table>';
    html += '<thead><tr><th>Code</th><th>Subject</th><th>Units</th><th>Action</th></tr></thead><tbody>';
    
    subs.forEach(function(sub) {
      html += '<tr>';
      html += '<td style="font-weight:600;">' + sub.code + '</td>';
      html += '<td>' + sub.name + '</td>';
      html += '<td style="text-align:center;">' + sub.units.length + '</td>';
      html += '<td><button class="open-btn" onclick="goToSubject(\'' + sub.id + '\')">Open</button></td>';
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    
    // Mobile card view
    html += '<div class="file-cards">';
    
    subs.forEach(function(sub) {
      html += '<div class="file-card" onclick="goToSubject(\'' + sub.id + '\')" style="cursor:pointer;">';
      html += '<div class="file-card-header">';
      html += '<div class="code-badge" style="flex-shrink:0;">' + sub.code + '</div>';
      html += '<div class="file-card-info">';
      html += '<div class="file-card-name">' + sub.name + '</div>';
      html += '<div class="file-card-filename">' + sub.units.length + ' units</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
    
    html += '</div></div>';
  });
  
  if (!html) {
    html = '<div class="no-data"><p>No subjects found</p></div>';
  }
  
  document.getElementById('dept-content').innerHTML = html;
}

function filterSem(sem, btn) {
  currentSemester = sem;
  
  document.querySelectorAll('#semester-filters .filter-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  
  renderDeptTable();
}

function renderSubject() {
  var dept = getDeptById(currentDeptId);
  var sub = getSubjectById(currentDeptId, currentSubjectId);
  
  if (!dept || !sub) return;
  
  document.getElementById('subject-title').textContent = sub.name;
  document.getElementById('subject-code').textContent = sub.code;
  
  var semNum = sub.semester || Object.keys(dept.semesters).find(function(s) {
    return dept.semesters[s].some(function(x) {
      return x.id === sub.id;
    });
  }) || '?';
  document.getElementById('subject-sem').textContent = semNum;
  document.getElementById('subject-dept-code').textContent = dept.code;
  
  var units = sub.units || [];
  if (units.length === 0) {
    document.getElementById('subject-content').innerHTML = '<div class="no-data"><p>No units available</p></div>';
    return;
  }
  
  units.sort(function(a, b) {
    return a.number - b.number;
  });
  
  var html = '<h2 class="section-title">Select Unit</h2>';
  html += '<div class="unit-cards">';
  
  units.forEach(function(u) {
    html += '<div class="unit-card" onclick="goToUnit(\'' + u.id + '\')">';
    html += '<div class="unit-card-number">' + u.number + '</div>';
    html += '<div class="unit-card-name">' + u.name + '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  document.getElementById('subject-content').innerHTML = html;
}

/* ============================================================
   RENDER UNIT FUNCTION - Shows subfolders as cards
   ============================================================
   Note: renderUnit is defined in page-specific JS files
   (notes-app.js or textbooks-app.js) because it uses
   getFolderContents and file display logic.
   ============================================================ */

/* ============================================================
   RENDER SUBFOLDER FUNCTION - Shows files in a subfolder
   ============================================================
   Note: renderSubfolder is defined in page-specific JS files
   ============================================================ */

/* ============================================================
   REFRESH BUTTON FUNCTION
   ============================================================ */

/**
 * Handles the refresh button click
 * Clears cache and reloads the current view
 */
async function handleRefreshFolders() {
  var btn = document.getElementById('refresh-btn');
  var statusEl = document.getElementById('cache-status');
  
  if (!btn) return;
  
  // Show loading state
  btn.classList.add('loading');
  btn.innerHTML = '<span class="refresh-icon">🔄</span> Refreshing...';
  
  try {
    // Call refresh function from drive-api.js
    await refreshStructure();
    
    // Show success state
    btn.classList.remove('loading');
    btn.classList.add('success');
    btn.innerHTML = '<span class="refresh-icon">✓</span> Updated!';
    
    // Update cache status
    updateCacheStatus();
    
    // Re-render current view
    if (currentSubfolderId) {
      goBackToUnit();
    } else if (currentUnitId) {
      goBackToSubject();
    } else if (currentSubjectId) {
      goToSubject(currentSubjectId);
    } else if (currentDeptId) {
      goToDept(currentDeptId);
    } else {
      // We're on home view
      renderHome();
      updateDeptButtons();
    }
    
    // Reset button after 2 seconds
    setTimeout(function() {
      btn.classList.remove('success');
      btn.innerHTML = '<span class="refresh-icon">🔄</span> Refresh';
    }, 2000);
    
  } catch (error) {
    console.error('Refresh failed:', error);
    
    // Show error state
    btn.classList.remove('loading');
    btn.innerHTML = '<span class="refresh-icon">⚠️</span> Error!';
    
    // Reset button after 2 seconds
    setTimeout(function() {
      btn.innerHTML = '<span class="refresh-icon">🔄</span> Refresh';
    }, 2000);
  }
}

/**
 * Updates the cache status indicator
 */
function updateCacheStatus() {
  var statusEl = document.getElementById('cache-status');
  if (!statusEl) return;
  
  if (typeof getCacheStatus !== 'function') return;
  
  var status = getCacheStatus();
  var folderType = status.folderType || 'Unknown';
  
  if (!status.hasCache) {
    statusEl.innerHTML = '<span class="cache-status">No cache (' + folderType + ')</span>';
  } else if (status.isFresh) {
    statusEl.innerHTML = '<span class="cache-status fresh">' + folderType + ' cached: ' + status.cacheAgeFormatted + '</span>';
  } else {
    statusEl.innerHTML = '<span class="cache-status stale">' + folderType + ' cached: ' + status.cacheAgeFormatted + '</span>';
  }
}

/* ============================================================
   MOBILE MENU FUNCTIONS
   ============================================================ */

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

/**
 * Close mobile menu when clicking outside
 */
document.addEventListener('click', function(e) {
  var menu = document.getElementById('mobileMenu');
  var toggle = document.querySelector('.mobile-menu-toggle');
  
  if (menu && menu.classList.contains('active')) {
    if (!menu.contains(e.target) && toggle && !toggle.contains(e.target)) {
      menu.classList.remove('active');
    }
  }
});
