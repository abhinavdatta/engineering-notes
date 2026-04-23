/**
 * ============================================================
 * TEXTBOOKS-APP.JS - Textbooks Page Application Module
 * ============================================================
 * 
 * This module is specific to the textbooks.html page.
 * Handles initialization and unit/subfolder rendering.
 * Same structure as notes-app.js but uses TEXTBOOK type.
 * ============================================================
 */

/* ============================================================
   VARIABLES
   ============================================================ */

var currentPdfUrl = null;
var currentSubfolderName = '';

/* ============================================================
   RENDER UNIT FUNCTION - Shows subfolders as cards
   ============================================================ */

async function renderUnit() {
  var sub = getSubjectById(currentDeptId, currentSubjectId);
  var unit = sub ? sub.units.find(function(u) {
    return u.id === currentUnitId;
  }) : null;
  
  if (!sub || !unit) return;
  
  document.getElementById('unit-title').textContent = unit.name;
  document.getElementById('unit-info').textContent = sub.name;
  
  document.getElementById('unit-content').innerHTML = '<div class="loading"><div class="loading-spinner"></div><p style="margin-top:16px;color:var(--text-secondary);">Loading...</p></div>';
  
  var contents = await getFolderContents(unit.folderId || unit.id);
  var folders = contents.folders || [];
  var files = contents.files || [];
  
  var html = '';
  
  if (folders.length > 0) {
    html += '<h2 class="section-title">Folders</h2>';
    html += '<div class="unit-cards">';
    
    folders.forEach(function(folder) {
      var folderType = detectFolderType(folder.name);
      
      html += '<div class="unit-card folder-card" onclick="goToSubfolder(\'' + folder.id + '\', \'' + escapeHtml(folder.name) + '\')">';
      html += '<div class="unit-card-icon">📁</div>';
      html += '<div class="unit-card-name">' + folder.name + '</div>';
      if (folderType) {
        html += '<div class="unit-card-type">' + folderType + '</div>';
      }
      html += '</div>';
    });
    
    html += '</div>';
  }
  
  if (files.length > 0) {
    html += '<h2 class="section-title" style="margin-top:' + (folders.length > 0 ? '32px' : '0') + '">Files</h2>';
    html += renderFilesTable(files);
  }
  
  if (folders.length === 0 && files.length === 0) {
    html = '<div class="no-data"><p>No content found in this unit</p></div>';
  }
  
  document.getElementById('unit-content').innerHTML = html;
}

/* ============================================================
   RENDER SUBFOLDER FUNCTION
   ============================================================ */

async function renderSubfolder(folderId, folderName) {
  currentSubfolderName = folderName;
  
  document.getElementById('subfolder-title').textContent = folderName;
  
  var unit = getUnitById(currentDeptId, currentSubjectId, currentUnitId);
  document.getElementById('subfolder-info').textContent = unit ? unit.name : '';
  
  document.getElementById('subfolder-content').innerHTML = '<div class="loading"><div class="loading-spinner"></div><p style="margin-top:16px;color:var(--text-secondary);">Loading files...</p></div>';
  
  var contents = await getFolderContents(folderId);
  var files = contents.files || [];
  var subfolders = contents.folders || [];
  
  var html = '';
  
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

function detectFolderType(name) {
  var lower = name.toLowerCase();
  
  if (lower.includes('textbook') || lower.includes('book')) return 'TEXTBOOK';
  if (lower.includes('reference') || lower.includes('ref')) return 'REFERENCE';
  if (lower.includes('guide')) return 'GUIDE';
  if (lower.includes('solution')) return 'SOLUTIONS';
  
  return '';
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

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
    html += '<button class="view-blue-btn" onclick="openModal(\'' + f.id + '\', \'' + escapeHtml(f.name) + '\')">View</button> ';
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
    html += '<button class="view-blue-btn" onclick="openModal(\'' + f.id + '\', \'' + escapeHtml(f.name) + '\')">View</button>';
    html += '<button class="open-btn" onclick="openTab(\'' + f.id + '\')">Open</button>';
    html += '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  
  return html;
}

function detectFileType(name) {
  var lower = name.toLowerCase();
  
  if (lower.includes('reference') || lower.includes('ref')) return 'REFERENCE';
  if (lower.includes('guide')) return 'GUIDE';
  if (lower.includes('solution')) return 'SOLUTIONS';
  
  return 'TEXTBOOK';
}

/* ============================================================
   MODAL FUNCTIONS
   ============================================================ */

function openModal(id, name) {
  currentPdfUrl = 'https://drive.google.com/file/d/' + id + '/preview';
  
  document.getElementById('modal-title').textContent = name.replace(/\.[^/.]+$/, '');
  document.getElementById('modal-type').textContent = detectFileType(name);
  document.getElementById('modal-filename').textContent = name;
  document.getElementById('pdf-iframe').src = currentPdfUrl;
  
  document.getElementById('pdf-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('pdf-modal').classList.add('hidden');
  document.getElementById('pdf-iframe').src = '';
  currentPdfUrl = null;
}

/* ============================================================
   FILE OPEN FUNCTIONS
   ============================================================ */

function openInDrive() {
  if (currentPdfUrl) {
    window.open(currentPdfUrl.replace('/preview', '/view'), '_blank');
  }
}

function openTab(id) {
  window.open('https://drive.google.com/file/d/' + id + '/view', '_blank');
}

/* ============================================================
   INITIALIZATION
   ============================================================ */

async function init() {
  try {
    console.log('[TextbooksApp] Starting initialization...');
    
    if (typeof toggleAds === 'function') {
      toggleAds(false);
    }
    
    createSubfolderView();
    
    if (structureLoaded && DATA.length > 0) {
      console.log('[TextbooksApp] Using cached data');
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
    
    console.log('[TextbooksApp] Building structure from Drive...');
    await buildStructure();
    console.log('[TextbooksApp] Structure built successfully, DATA length:', DATA.length);
    
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
    console.error('[TextbooksApp] Error loading data:', error);
    var errorMsg = error && error.message ? error.message : 'Unknown error';
    document.getElementById('home-content').innerHTML = '<div class="no-data"><p>Error loading data: ' + errorMsg + '</p><p><button onclick="location.reload()">Refresh Page</button></p></div>';
  }
}

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
