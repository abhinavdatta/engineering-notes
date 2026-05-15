/**
 * ============================================================
 * NOTES-APP.JS - Notes Page Application Module
 * ============================================================
 * 
 * This module is specific to the notes.html page.
 * Handles initialization and unit/subfolder rendering.
 * ============================================================
 */

/* ============================================================
   VARIABLES
   ============================================================ */

var currentPdfUrl = null;

// Store subfolder info for navigation
var currentSubfolderName = '';

/* ============================================================
   RENDER UNIT FUNCTION - Shows subfolders as cards
   ============================================================ */

/**
 * Renders the unit view with subfolders and files
 * Shows subfolders as clickable cards first
 */
async function renderUnit() {
  var sub = getSubjectById(currentDeptId, currentSubjectId);
  var unit = sub ? sub.units.find(function(u) {
    return u.id === currentUnitId;
  }) : null;
  
  if (!sub || !unit) return;
  
  // Update header
  document.getElementById('unit-title').textContent = unit.name;
  document.getElementById('unit-info').textContent = sub.name;
  
  // Show loading state
  document.getElementById('unit-content').innerHTML = '<div class="loading"><div class="loading-spinner"></div><p style="margin-top:16px;color:var(--text-secondary);">Loading...</p></div>';
  
  // Get folder contents (subfolders and files)
  var contents = await getFolderContents(unit.folderId || unit.id);
  var folders = contents.folders || [];
  var files = contents.files || [];
  
  var html = '';
  
  // If there are subfolders, show them as cards
  if (folders.length > 0) {
    html += '<h2 class="section-title">Folders</h2>';
    html += '<div class="unit-cards">';
    
    folders.forEach(function(folder) {
      // Determine folder type based on name
      var folderIcon = '📁';
      var folderType = detectFolderType(folder.name);
      
      html += '<div class="unit-card folder-card" onclick="goToSubfolder(\'' + folder.id + '\', \'' + escapeHtml(folder.name) + '\')">';
      html += '<div class="unit-card-icon">' + folderIcon + '</div>';
      html += '<div class="unit-card-name">' + folder.name + '</div>';
      if (folderType) {
        html += '<div class="unit-card-type">' + folderType + '</div>';
      }
      html += '</div>';
    });
    
    html += '</div>';
  }
  
  // If there are direct files, show them in a table
  if (files.length > 0) {
    html += '<h2 class="section-title" style="margin-top:' + (folders.length > 0 ? '32px' : '0') + '">Files</h2>';
    html += renderFilesTable(files);
  }
  
  // If no folders and no files
  if (folders.length === 0 && files.length === 0) {
    html = '<div class="no-data"><p>No content found in this unit</p></div>';
  }
  
  document.getElementById('unit-content').innerHTML = html;
}

/* ============================================================
   RENDER SUBFOLDER FUNCTION - Shows files in a subfolder
   ============================================================ */

/**
 * Renders the subfolder view with files
 * @param {string} folderId - The subfolder ID
 * @param {string} folderName - The subfolder name
 */
async function renderSubfolder(folderId, folderName) {
  currentSubfolderName = folderName;
  
  // Update header
  document.getElementById('subfolder-title').textContent = folderName;
  
  var unit = getUnitById(currentDeptId, currentSubjectId, currentUnitId);
  document.getElementById('subfolder-info').textContent = unit ? unit.name : '';
  
  // Show loading
  document.getElementById('subfolder-content').innerHTML = '<div class="loading"><div class="loading-spinner"></div><p style="margin-top:16px;color:var(--text-secondary);">Loading files...</p></div>';
  
  // Get files in this subfolder
  var contents = await getFolderContents(folderId);
  var files = contents.files || [];
  var subfolders = contents.folders || [];
  
  var html = '';
  
  // Show subfolders if any
  if (subfolders.length > 0) {
    html += '<h2 class="section-title">Subfolders</h2>';
    html += '<div class="unit-cards">';
    
    subfolders.forEach(function(folder) {
      html += '<div class="unit-card folder-card" onclick="goToSubfolder(\'' + folder.id + '\', \'' + escapeHtml(folder.name) + '\')">';
      html += '<div class="unit-card-icon">📁</div>';
      html += '<div class="unit-card-name">' + folder.name + '</div>';
      html += '</div>';
    });
    
    html += '</div>';
  }
  
  // Show files
  if (files.length > 0) {
    html += '<h2 class="section-title" style="margin-top:' + (subfolders.length > 0 ? '32px' : '0') + '">Files (' + files.length + ')</h2>';
    html += renderFilesTable(files);
  }
  
  if (files.length === 0 && subfolders.length === 0) {
    html = '<div class="no-data"><p>This folder is empty</p></div>';
  }
  
  document.getElementById('subfolder-content').innerHTML = html;
}

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

/**
 * Detects folder type from name
 * @param {string} name - Folder name
 * @returns {string} Folder type label
 */
function detectFolderType(name) {
  var lower = name.toLowerCase();
  
  if (lower.includes('note') || lower.includes('notes')) return 'NOTES';
  if (lower.includes('question') || lower.includes('qp') || lower.includes('paper')) return 'QP';
  if (lower.includes('lab') || lower.includes('practical')) return 'LAB';
  if (lower.includes('assignment') || lower.includes('assign')) return 'ASSIGNMENT';
  if (lower.includes('reference') || lower.includes('ref')) return 'REFERENCE';
  if (lower.includes('textbook') || lower.includes('book')) return 'TEXTBOOK';
  
  return '';
}

/**
 * Escapes HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * Renders a table of files (desktop) and cards (mobile)
 * @param {Array} files - Array of file objects
 * @returns {string} HTML string
 */
function renderFilesTable(files) {
  var html = '';
  
  // Desktop table view
  html += '<div class="table-container"><table>';
  html += '<thead><tr><th>#</th><th>File</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
  
  files.forEach(function(f, i) {
    var type = detectFileType(f.name);
    
    html += '<tr>';
    html += '<td style="text-align:center;color:var(--text-muted);">' + (i + 1) + '</td>';
    html += '<td><strong>' + f.name.replace(/\.[^/.]+$/, '') + '</strong><br>';
    html += '<small style="color:var(--text-muted);">' + f.name + '</small></td>';
    html += '<td style="text-align:center;"><span class="code-badge">' + type + '</span></td>';
    html += '<td>';
    html += '<button class="view-green-btn" onclick="openModal(\'' + f.id + '\', \'' + escapeHtml(f.name) + '\')">View</button> ';
    html += '<button class="open-btn" onclick="openTab(\'' + f.id + '\')">Open</button>';
    html += '</td>';
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  // Mobile card view
  html += '<div class="file-cards">';
  
  files.forEach(function(f, i) {
    var type = detectFileType(f.name);
    var displayName = f.name.replace(/\.[^/.]+$/, '');
    
    html += '<div class="file-card">';
    html += '<div class="file-card-header">';
    html += '<div class="file-card-number">' + (i + 1) + '</div>';
    html += '<div class="file-card-info">';
    html += '<div class="file-card-name">' + displayName + '</div>';
    html += '<div class="file-card-filename">' + f.name + ' • ' + type + '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="file-card-actions">';
    html += '<button class="view-green-btn" onclick="openModal(\'' + f.id + '\', \'' + escapeHtml(f.name) + '\')">View</button>';
    html += '<button class="open-btn" onclick="openTab(\'' + f.id + '\')">Open</button>';
    html += '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  
  return html;
}

/**
 * Detects file type from name
 * @param {string} name - File name
 * @returns {string} File type
 */
function detectFileType(name) {
  var lower = name.toLowerCase();
  
  if (lower.includes('question') || lower.includes('qp')) return 'QP';
  if (lower.includes('lab')) return 'LAB';
  
  return 'NOTES';
}

/* ============================================================
   MODAL FUNCTIONS
   ============================================================ */

/**
 * Opens the PDF viewer modal
 * @param {string} id - File ID
 * @param {string} name - File name
 */
function openModal(id, name) {
  currentPdfUrl = 'https://drive.google.com/file/d/' + id + '/preview';
  
  document.getElementById('modal-title').textContent = name.replace(/\.[^/.]+$/, '');
  document.getElementById('modal-type').textContent = detectFileType(name);
  document.getElementById('modal-filename').textContent = name;
  document.getElementById('pdf-iframe').src = currentPdfUrl;
  
  document.getElementById('pdf-modal').classList.remove('hidden');
}

/**
 * Closes the PDF viewer modal
 */
function closeModal() {
  document.getElementById('pdf-modal').classList.add('hidden');
  document.getElementById('pdf-iframe').src = '';
  currentPdfUrl = null;
}

/* ============================================================
   FILE OPEN FUNCTIONS
   ============================================================ */

/**
 * Opens current file in Google Drive
 */
function openInDrive() {
  if (currentPdfUrl) {
    window.open(currentPdfUrl.replace('/preview', '/view'), '_blank');
  }
}

/**
 * Opens a file in a new tab
 * @param {string} id - File ID
 */
function openTab(id) {
  window.open('https://drive.google.com/file/d/' + id + '/view', '_blank');
}

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {
  try {
    console.log('[NotesApp] Starting initialization...');
    
    // Hide ads on home view
    if (typeof toggleAds === 'function') {
      toggleAds(false);
    }
    
    // Create subfolder view if needed
    createSubfolderView();
    
    // Check if already loaded
    if (structureLoaded && DATA.length > 0) {
      console.log('[NotesApp] Using cached data');
      updateDeptButtons();
      updateBackButton();
      renderHome();
      updateCacheStatus();
      
      // Restore from URL hash if present
      if (typeof initFromHash === 'function') {
        initFromHash();
        if (currentDeptId || currentSubjectId || currentUnitId || currentSubfolderId) {
          restoreFromState({
            deptId: currentDeptId,
            subjectId: currentSubjectId,
            unitId: currentUnitId,
            subfolderId: currentSubfolderId
          });
        }
      }
      return;
    }
    
    // Build structure from Google Drive
    console.log('[NotesApp] Building structure from Drive...');
    await buildStructure();
    console.log('[NotesApp] Structure built successfully, DATA length:', DATA.length);
    
    // Update UI
    updateDeptButtons();
    updateBackButton();
    renderHome();
    updateCacheStatus();
    
    // Restore from URL hash if present
    if (typeof initFromHash === 'function') {
      initFromHash();
      if (currentDeptId || currentSubjectId || currentUnitId || currentSubfolderId) {
        restoreFromState({
          deptId: currentDeptId,
          subjectId: currentSubjectId,
          unitId: currentUnitId,
          subfolderId: currentSubfolderId
        });
      }
    }
    
  } catch (error) {
    console.error('[NotesApp] Error loading data:', error);
    var errorMsg = error && error.message ? error.message : 'Unknown error';
    document.getElementById('home-content').innerHTML = '<div class="no-data"><p>Error loading data: ' + errorMsg + '</p><p><button onclick="location.reload()">Refresh Page</button></p></div>';
  }
}

/**
 * Renders the home view
 * Uses the modern card-based design from navigation.js
 * Note: renderHome() is defined in navigation.js with department cards
 */

/* ============================================================
   CREATE SUBFOLDER VIEW
   ============================================================ */

function createSubfolderView() {
  if (document.getElementById('subfolder-view')) return;
  
  var html = '<div id="subfolder-view" class="hidden">';
  html += '<div class="dept-header">';
  html += '<h1 class="dept-title" id="subfolder-title">Folder</h1>';
  html += '<p class="dept-info" id="subfolder-info">Files</p>';
  html += '</div>';
  html += '<div class="main" id="subfolder-content"></div>';
  html += '</div>';
  
  var footer = document.querySelector('.footer');
  if (footer) {
    footer.insertAdjacentHTML('beforebegin', html);
  }
}

/* ============================================================
   AUTO-INITIALIZATION
   ============================================================ */
init();
