/**
 * ============================================================
 * DRIVE-API.JS - Google Drive API Module
 * ============================================================
 * 
 * This module handles all Google Drive API interactions:
 * - Loading the Google API client
 * - Fetching folders and files
 * - Caching API responses (with cookie consent)
 * - Building the folder structure
 * 
 * CACHING:
 * - Uses cacheManager for localStorage caching
 * - Only caches if user has accepted cookies
 * - Cache TTL: 24 hours by default
 * - Separate cache for Notes and Textbooks (based on ROOT_FOLDER_ID)
 * 
 * USAGE:
 * 1. Set API_KEY and ROOT_FOLDER_ID before calling init
 * 2. Call loadGoogleAPI() to initialize the API client
 * 3. Use fetchFolders() and loadFilesFromFolder() to get data
 * 
 * FUNCTIONS:
 * - loadGoogleAPI()         : Initialize Google API client
 * - fetchFolders(parentId)  : Get all folders in a parent
 * - fetchFiles(parentId)    : Get all files in a folder (not subfolders)
 * - loadFilesFromFolder(id) : Get all files including from subfolders
 * - buildStructure()        : Build complete folder structure
 * - clearDriveCache()       : Clear all cached Drive data
 * ============================================================
 */

/* ============================================================
   API CONFIGURATION
   ============================================================ */

/**
 * Google API Key for Drive API access
 * @constant {string}
 */
var API_KEY = 'AIzaSyCC8BbNNG2HhwEJ74GRBoos_lvREUPUN2Y';

/**
 * Root folder ID for the Drive structure
 * Set this before using the module
 * @type {string}
 */
var ROOT_FOLDER_ID = '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG'; // Notes Drive
// var ROOT_FOLDER_ID = '1qdcMtjkSDhOFolDIHB6lLi6dK57ZTlmi'; // Textbooks Drive

/**
 * Cache TTL in milliseconds (24 hours)
 * @constant {number}
 */
var CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * Memory cache for loaded files (session-only, no consent needed)
 * Keyed by ROOT_FOLDER_ID to separate Notes and Textbooks
 * @type {Object}
 */
var filesCache = {};

/**
 * Memory cache for folder structure (session-only, no consent needed)
 * Keyed by ROOT_FOLDER_ID to separate Notes and Textbooks
 * @type {Object}
 */
var foldersCache = {};

/**
 * Flag to track if structure has been loaded (per ROOT_FOLDER_ID)
 * @type {Object}
 */
var structureLoadedMap = {};

/**
 * Main data structure holding all folders/files (per ROOT_FOLDER_ID)
 * @type {Object}
 */
var DATA_MAP = {};

/**
 * Convenience getter for current DATA
 */
Object.defineProperty(window, 'DATA', {
  get: function() { return DATA_MAP[ROOT_FOLDER_ID] || []; },
  set: function(val) { DATA_MAP[ROOT_FOLDER_ID] = val; }
});

/**
 * Convenience getter for structureLoaded
 */
Object.defineProperty(window, 'structureLoaded', {
  get: function() { return structureLoadedMap[ROOT_FOLDER_ID] || false; },
  set: function(val) { structureLoadedMap[ROOT_FOLDER_ID] = val; }
});

/* ============================================================
   CACHE KEYS - Include ROOT_FOLDER_ID for separation
   ============================================================ */

/**
 * Gets cache key prefix for current ROOT_FOLDER_ID
 * This ensures Notes and Textbooks have separate caches
 * @returns {string} Cache key prefix
 */
function getCachePrefix() {
  return 'drive_' + ROOT_FOLDER_ID.substring(0, 8) + '_';
}

/**
 * Cache key templates (will be combined with ROOT_FOLDER_ID)
 */
var CACHE_KEY_TEMPLATES = {
  STRUCTURE: 'structure',
  FOLDERS: 'folders_',
  FILES: 'files_'
};

/**
 * Gets the full cache key for a specific type
 * @param {string} type - Cache type (STRUCTURE, FOLDERS, FILES)
 * @param {string} suffix - Optional suffix (e.g., folder ID)
 * @returns {string} Full cache key
 */
function getCacheKey(type, suffix) {
  suffix = suffix || '';
  return getCachePrefix() + CACHE_KEY_TEMPLATES[type] + suffix;
}

/* ============================================================
   DEPARTMENT CODE MAPPING
   ============================================================ */
var DEPT_CODES = {
  'artificial intelligence': 'AIDS',
  'aids': 'AIDS',
  'civil': 'CE',
  'ce': 'CE',
  'computer science': 'CSE',
  'cse': 'CSE',
  'electronics': 'ECE',
  'ece': 'ECE',
  'electrical': 'EEE',
  'eee': 'EEE',
  'instrumentation': 'EIE',
  'eie': 'EIE',
  'information technology': 'IT',
  'it': 'IT',
  'mechanical': 'ME',
  'me': 'ME'
};

/* ============================================================
   CACHE HELPER FUNCTIONS
   ============================================================ */

/**
 * Gets cached data if available and not expired
 * @param {string} key - Cache key (without prefix, will be added)
 * @returns {*} Cached data or null
 */
function getCachedData(key) {
  // Check if cacheManager is available (cookie consent given)
  if (typeof cacheManager !== 'undefined' && cacheManager.isAvailable()) {
    return cacheManager.get(key, CACHE_TTL);
  }
  return null;
}

/**
 * Sets data in cache if consent given
 * @param {string} key - Cache key (without prefix, will be added)
 * @param {*} value - Data to cache
 */
function setCachedData(key, value) {
  if (typeof cacheManager !== 'undefined' && cacheManager.isAvailable()) {
    cacheManager.set(key, value, CACHE_TTL);
  }
}

/**
 * Clears cache for current ROOT_FOLDER_ID only
 */
function clearCurrentCache() {
  var prefix = getCachePrefix();
  
  // Clear localStorage cache for this ROOT_FOLDER_ID only
  if (typeof cacheManager !== 'undefined') {
    // Remove structure cache
    cacheManager.remove(getCacheKey('STRUCTURE'));
    
    // Remove folder and file caches (need to iterate localStorage)
    for (var i = localStorage.length - 1; i >= 0; i--) {
      var key = localStorage.key(i);
      if (key && key.includes(prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
  
  // Clear memory cache for this ROOT_FOLDER_ID
  delete DATA_MAP[ROOT_FOLDER_ID];
  delete structureLoadedMap[ROOT_FOLDER_ID];
  
  // Clear file/folder caches (keyed by folder ID, but we can't easily filter)
  // These will be repopulated on next fetch
  filesCache = {};
  foldersCache = {};
  
  console.log('[DriveAPI] Cache cleared for', ROOT_FOLDER_ID === '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG' ? 'Notes' : 'Textbooks');
}

/**
 * Clears all Drive-related cache (both Notes and Textbooks)
 */
function clearDriveCache() {
  if (typeof cacheManager !== 'undefined') {
    cacheManager.clear();
  }
  
  // Clear all memory caches
  filesCache = {};
  foldersCache = {};
  structureLoadedMap = {};
  DATA_MAP = {};
  
  console.log('[DriveAPI] All cache cleared');
}

/* ============================================================
   LOAD GOOGLE API FUNCTION
   ============================================================ */

/**
 * Loads the Google API client library
 * @returns {Promise} Resolves when API is ready
 */
function loadGoogleAPI() {
  return new Promise(function(resolve, reject) {
    if (window.gapi && window.gapi.client) {
      resolve();
      return;
    }
    
    var script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    
    script.onload = function() {
      window.gapi.load('client', function() {
        window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        }).then(resolve, reject);
      });
    };
    
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* ============================================================
   FETCH FOLDERS FUNCTION
   ============================================================ */

/**
 * Fetches all folders within a parent folder
 * Uses caching if available
 * @param {string} parentId - The parent folder ID
 * @returns {Promise<Array>} Array of folder objects
 */
async function fetchFolders(parentId) {
  // Create cache key specific to this ROOT_FOLDER_ID
  var cacheKey = getCacheKey('FOLDERS', parentId);
  
  // Check memory cache first (fastest)
  if (foldersCache[cacheKey]) {
    return foldersCache[cacheKey];
  }
  
  // Check localStorage cache (if consent given)
  var cached = getCachedData(cacheKey);
  if (cached) {
    foldersCache[cacheKey] = cached;
    return cached;
  }
  
  // Fetch from API
  await loadGoogleAPI();
  
  var allFolders = [];
  var pageToken = null;
  
  do {
    var params = {
      q: "'" + parentId + "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      orderBy: 'name',
      fields: 'nextPageToken, files(id, name)',
      pageSize: 1000
    };
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    var response = await window.gapi.client.drive.files.list(params);
    var files = response.result.files || [];
    
    allFolders = allFolders.concat(files);
    pageToken = response.result.nextPageToken;
    
  } while (pageToken);
  
  // Cache results
  foldersCache[cacheKey] = allFolders;
  setCachedData(cacheKey, allFolders);
  
  return allFolders;
}

/* ============================================================
   FETCH FILES FUNCTION (Files only, not folders)
   ============================================================ */

/**
 * Fetches only files (not folders) within a parent folder
 * Uses caching if available
 * @param {string} parentId - The parent folder ID
 * @returns {Promise<Array>} Array of file objects
 */
async function fetchFiles(parentId) {
  // Create cache key specific to this ROOT_FOLDER_ID
  var cacheKey = getCacheKey('FILES', parentId);
  
  // Check memory cache first
  if (filesCache[cacheKey]) {
    return filesCache[cacheKey];
  }
  
  // Check localStorage cache
  var cached = getCachedData(cacheKey);
  if (cached) {
    filesCache[cacheKey] = cached;
    return cached;
  }
  
  await loadGoogleAPI();
  
  var allFiles = [];
  var pageToken = null;
  
  do {
    var params = {
      q: "'" + parentId + "' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
      orderBy: 'name',
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 1000
    };
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    var response = await window.gapi.client.drive.files.list(params);
    var files = response.result.files || [];
    
    allFiles = allFiles.concat(files);
    pageToken = response.result.nextPageToken;
    
  } while (pageToken);
  
  // Cache results
  filesCache[cacheKey] = allFiles;
  setCachedData(cacheKey, allFiles);
  
  return allFiles;
}

/* ============================================================
   GET FOLDER CONTENTS (Folders + Files separately)
   ============================================================ */

/**
 * Gets both subfolders and files within a folder
 * @param {string} folderId - The folder ID
 * @returns {Promise<Object>} Object with folders and files arrays
 */
async function getFolderContents(folderId) {
  // Fetch folders and files in parallel
  var [folders, files] = await Promise.all([
    fetchFolders(folderId),
    fetchFiles(folderId)
  ]);
  
  return { folders: folders, files: files };
}

/* ============================================================
   DETECT SEMESTER FUNCTION
   ============================================================ */

/**
 * Detects semester number from folder name
 * @param {string} name - Folder name to parse
 * @returns {number|null} Semester number (1-8) or null
 */
function detectSemester(name) {
  var lower = name.toLowerCase();
  var match = lower.match(/sem\s*(\d)|semester\s*(\d)|s(\d)|(\d)(?:st|nd|rd|th)\s*sem/i);
  
  if (match) {
    return parseInt(match[1] || match[2] || match[3] || match[4]);
  }
  
  return null;
}

/* ============================================================
   DETECT UNIT NUMBER FUNCTION
   ============================================================ */

/**
 * Detects unit number from folder name
 * @param {string} name - Folder name to parse
 * @returns {number|null} Unit number or null
 */
function detectUnitNumber(name) {
  var lower = name.toLowerCase();
  
  var patterns = [
    /unit\s*[-_]?\s*(\d)/i,
    /u[-_]?\s*(\d)(?!\w)/i,
    /module\s*[-_]?\s*(\d)/i,
    /mod\s*[-_]?\s*(\d)/i,
    /chapter\s*[-_]?\s*(\d)/i,
    /ch\s*[-_]?\s*(\d)/i,
    /^(\d)$/
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    var match = lower.match(patterns[i]);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

/* ============================================================
   GET DEPARTMENT CODE FUNCTION
   ============================================================ */

/**
 * Gets department code from department name
 * @param {string} name - Department name
 * @returns {string} Department code
 */
function getDeptCode(name) {
  var lower = name.toLowerCase();
  
  for (var key in DEPT_CODES) {
    if (lower.includes(key)) {
      return DEPT_CODES[key];
    }
  }
  
  return name.substring(0, 3).toUpperCase();
}

/* ============================================================
   BUILD STRUCTURE FUNCTION
   ============================================================ */

/**
 * Builds the complete folder structure from Google Drive
 * Uses caching if available to reduce API calls
 * @returns {Promise<Array>} Complete data structure
 */
async function buildStructure() {
  // Check if already loaded in memory for this ROOT_FOLDER_ID
  if (structureLoadedMap[ROOT_FOLDER_ID] && DATA_MAP[ROOT_FOLDER_ID] && DATA_MAP[ROOT_FOLDER_ID].length > 0) {
    console.log('[DriveAPI] Using in-memory structure');
    return DATA_MAP[ROOT_FOLDER_ID];
  }
  
  // Check localStorage cache for this ROOT_FOLDER_ID
  var structureCacheKey = getCacheKey('STRUCTURE');
  var cachedStructure = getCachedData(structureCacheKey);
  
  if (cachedStructure && cachedStructure.length > 0) {
    DATA_MAP[ROOT_FOLDER_ID] = cachedStructure;
    structureLoadedMap[ROOT_FOLDER_ID] = true;
    console.log('[DriveAPI] Loaded from cache for', ROOT_FOLDER_ID === '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG' ? 'Notes' : 'Textbooks');
    return DATA_MAP[ROOT_FOLDER_ID];
  }
  
  // Fetch from API
  console.log('[DriveAPI] Fetching from API for', ROOT_FOLDER_ID === '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG' ? 'Notes' : 'Textbooks');
  await loadGoogleAPI();
  
  var deptFolders = await fetchFolders(ROOT_FOLDER_ID);
  var data = [];
  
  for (var i = 0; i < deptFolders.length; i++) {
    var dept = deptFolders[i];
    var deptData = {
      id: dept.id,
      code: getDeptCode(dept.name),
      name: dept.name,
      folderId: dept.id,
      semesters: {}
    };
    
    var subFolders = await fetchFolders(dept.id);
    
    for (var j = 0; j < subFolders.length; j++) {
      var sub = subFolders[j];
      var semNum = detectSemester(sub.name);
      
      if (semNum !== null) {
        if (!deptData.semesters[semNum]) {
          deptData.semesters[semNum] = [];
        }
        
        var subjectFolders = await fetchFolders(sub.id);
        for (var k = 0; k < subjectFolders.length; k++) {
          var subj = subjectFolders[k];
          var subjectData = await buildSubjectData(subj, semNum);
          deptData.semesters[semNum].push(subjectData);
        }
      } else {
        var detectedSem = detectSemesterFromSubject(sub.name) || 1;
        if (!deptData.semesters[detectedSem]) {
          deptData.semesters[detectedSem] = [];
        }
        var subjectData = await buildSubjectData(sub, detectedSem);
        deptData.semesters[detectedSem].push(subjectData);
      }
    }
    
    for (var s = 1; s <= 8; s++) {
      if (!deptData.semesters[s]) {
        deptData.semesters[s] = [];
      }
    }
    
    data.push(deptData);
  }
  
  // Cache for this ROOT_FOLDER_ID
  DATA_MAP[ROOT_FOLDER_ID] = data;
  structureLoadedMap[ROOT_FOLDER_ID] = true;
  setCachedData(structureCacheKey, data);
  
  console.log('[DriveAPI] Structure built and cached');
  return data;
}

/* ============================================================
   DETECT SEMESTER FROM SUBJECT FUNCTION
   ============================================================ */

function detectSemesterFromSubject(name) {
  var lower = name.toLowerCase();
  var match = lower.match(/sem\s*(\d)|s(\d)(?=\s*-|\s*_|\s|$)/i);
  if (match) {
    return parseInt(match[1] || match[2]);
  }
  return null;
}

/* ============================================================
   BUILD SUBJECT DATA FUNCTION
   ============================================================ */

/**
 * Builds subject data with units
 * @param {Object} folder - Folder object
 * @param {number} semNum - Semester number
 * @returns {Promise<Object>} Subject data with units
 */
async function buildSubjectData(folder, semNum) {
  var subFolders = await fetchFolders(folder.id);
  var unitsData = [];
  
  var hasUnitFolders = false;
  for (var i = 0; i < subFolders.length; i++) {
    var u = subFolders[i];
    var unitNum = detectUnitNumber(u.name);
    if (unitNum !== null) {
      hasUnitFolders = true;
      unitsData.push({
        id: u.id,
        name: u.name,
        number: unitNum,
        folderId: u.id
      });
    }
  }
  
  if (!hasUnitFolders && subFolders.length > 0) {
    for (var i = 0; i < subFolders.length; i++) {
      var u = subFolders[i];
      unitsData.push({
        id: u.id,
        name: u.name,
        number: i + 1,
        folderId: u.id
      });
    }
  }
  
  unitsData.sort(function(a, b) {
    return a.number - b.number;
  });
  
  if (unitsData.length === 0) {
    unitsData.push({
      id: folder.id,
      name: 'All Files',
      number: 1,
      folderId: folder.id,
      isDefault: true
    });
  }
  
  return {
    id: folder.id,
    code: folder.name.substring(0, 8).toUpperCase(),
    name: folder.name,
    folderId: folder.id,
    semester: semNum,
    units: unitsData
  };
}

/* ============================================================
   REFRESH STRUCTURE FUNCTION
   ============================================================ */

/**
 * Forces a refresh of the folder structure from the API
 * Clears cache for current ROOT_FOLDER_ID and fetches fresh data
 * @returns {Promise<Array>} Fresh data structure
 */
async function refreshStructure() {
  console.log('[DriveAPI] Refreshing structure...');
  
  // Clear cache for current ROOT_FOLDER_ID only
  clearCurrentCache();
  
  // Fetch fresh data from API
  await loadGoogleAPI();
  
  var deptFolders = await fetchFolders(ROOT_FOLDER_ID);
  var data = [];
  
  for (var i = 0; i < deptFolders.length; i++) {
    var dept = deptFolders[i];
    var deptData = {
      id: dept.id,
      code: getDeptCode(dept.name),
      name: dept.name,
      folderId: dept.id,
      semesters: {}
    };
    
    var subFolders = await fetchFolders(dept.id);
    
    for (var j = 0; j < subFolders.length; j++) {
      var sub = subFolders[j];
      var semNum = detectSemester(sub.name);
      
      if (semNum !== null) {
        if (!deptData.semesters[semNum]) {
          deptData.semesters[semNum] = [];
        }
        
        var subjectFolders = await fetchFolders(sub.id);
        for (var k = 0; k < subjectFolders.length; k++) {
          var subj = subjectFolders[k];
          var subjectData = await buildSubjectData(subj, semNum);
          deptData.semesters[semNum].push(subjectData);
        }
      } else {
        var detectedSem = detectSemesterFromSubject(sub.name) || 1;
        if (!deptData.semesters[detectedSem]) {
          deptData.semesters[detectedSem] = [];
        }
        var subjectData = await buildSubjectData(sub, detectedSem);
        deptData.semesters[detectedSem].push(subjectData);
      }
    }
    
    for (var s = 1; s <= 8; s++) {
      if (!deptData.semesters[s]) {
        deptData.semesters[s] = [];
      }
    }
    
    data.push(deptData);
  }
  
  // Cache the fresh structure
  DATA_MAP[ROOT_FOLDER_ID] = data;
  structureLoadedMap[ROOT_FOLDER_ID] = true;
  setCachedData(getCacheKey('STRUCTURE'), data);
  
  console.log('[DriveAPI] Structure refreshed and cached');
  
  return data;
}

/**
 * Gets the cache status for current ROOT_FOLDER_ID
 * @returns {Object} Cache status info
 */
function getCacheStatus() {
  var structureCacheKey = getCacheKey('STRUCTURE');
  var hasCache = false;
  var cacheAge = null;
  
  if (typeof cacheManager !== 'undefined' && cacheManager.isAvailable()) {
    // Check if we have cached data
    var cacheKey = 'enginotes_cache_' + structureCacheKey;
    var item = localStorage.getItem(cacheKey);
    if (item) {
      try {
        var data = JSON.parse(item);
        hasCache = true;
        if (data.timestamp) {
          cacheAge = Date.now() - data.timestamp;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  
  return {
    hasCache: hasCache,
    cacheAge: cacheAge,
    cacheAgeFormatted: cacheAge ? formatCacheAge(cacheAge) : null,
    isFresh: cacheAge ? cacheAge < (CACHE_TTL / 2) : false,
    folderType: ROOT_FOLDER_ID === '1SNnQiyuSNuJUSbs_GCgR8vRmYwxzJ3JG' ? 'Notes' : 'Textbooks'
  };
}

/**
 * Formats cache age in human-readable format
 * @param {number} ms - Age in milliseconds
 * @returns {string} Formatted age
 */
function formatCacheAge(ms) {
  var seconds = Math.floor(ms / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  
  if (days > 0) {
    return days + 'd ' + (hours % 24) + 'h ago';
  } else if (hours > 0) {
    return hours + 'h ' + (minutes % 60) + 'm ago';
  } else if (minutes > 0) {
    return minutes + 'm ago';
  } else {
    return 'just now';
  }
}
