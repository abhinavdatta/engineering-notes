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
 * CONFIGURATION:
 * - All configuration is loaded from window.CONFIG (see config.js)
 * - Set environment variables in Cloudflare Dashboard or config.js
 * - Required: GOOGLE_DRIVE_API_KEY, NOTES_FOLDER_ID, TEXTBOOKS_FOLDER_ID
 * 
 * CACHING:
 * - Uses cacheManager for localStorage caching
 * - Only caches if user has accepted cookies
 * - Cache TTL: Configurable via CACHE_TTL_HOURS (default: 24)
 * - Separate cache for Notes and Textbooks (based on ROOT_FOLDER_ID)
 * 
 * USAGE:
 * 1. Load config.js BEFORE this script
 * 2. Set window.ROOT_FOLDER_ID BEFORE loading this script (or use CONFIG)
 * 3. Call loadGoogleAPI() to initialize the API client
 * 4. Use fetchFolders() and loadFilesFromFolder() to get data
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
   API CONFIGURATION - Uses window.CONFIG from config.js
   ============================================================ */

/**
 * Gets the API key from CONFIG
 * @returns {string} Google API Key
 */
function getApiKey() {
  return (window.CONFIG && window.CONFIG.GOOGLE_DRIVE_API_KEY) || 'YOUR_GOOGLE_DRIVE_API_KEY';
}

/**
 * Gets the default root folder ID (Notes folder)
 * @returns {string} Default root folder ID
 */
function getDefaultRootFolderId() {
  return (window.CONFIG && window.CONFIG.NOTES_FOLDER_ID) || 'YOUR_NOTES_FOLDER_ID';
}

/**
 * Gets cache TTL from CONFIG
 * @returns {number} Cache TTL in milliseconds
 */
function getCacheTTL() {
  if (window.CONFIG && typeof window.CONFIG.getCacheTTL === 'function') {
    return window.CONFIG.getCacheTTL();
  }
  return 24 * 60 * 60 * 1000; // Default: 24 hours
}

/**
 * Cache TTL in milliseconds (dynamic, from CONFIG)
 */
var CACHE_TTL = getCacheTTL();

/**
 * Auto-refresh threshold in milliseconds (12 hours)
 * If cache is older than this, refresh silently in background
 * @constant {number}
 */
var AUTO_REFRESH_THRESHOLD = 12 * 60 * 60 * 1000;

/**
 * Auto-refresh threshold in milliseconds (12 hours)
 * If cache is older than this, refresh silently in background
 * @constant {number}
 */
var AUTO_REFRESH_THRESHOLD = 12 * 60 * 60 * 1000;

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

/* ============================================================
   ROOT_FOLDER_ID GETTER - Always reads from window
   ============================================================ */

/**
 * Gets the current ROOT_FOLDER_ID
 * Always reads from window.ROOT_FOLDER_ID set by the HTML page
 * @returns {string} Current root folder ID
 */
function getRootFolderId() {
  // Priority: window.ROOT_FOLDER_ID > CONFIG > Default
  if (window.ROOT_FOLDER_ID) {
    return window.ROOT_FOLDER_ID;
  }
  if (window.CONFIG && window.CONFIG.NOTES_FOLDER_ID) {
    return window.CONFIG.NOTES_FOLDER_ID;
  }
  return getDefaultRootFolderId();
}

// Define ROOT_FOLDER_ID as a getter that always reads from window
Object.defineProperty(window, '_rootFolderIdGetter', {
  get: function() { return getRootFolderId(); }
});

/**
 * Convenience getter for current DATA
 */
Object.defineProperty(window, 'DATA', {
  get: function() { 
    var rootId = getRootFolderId();
    return DATA_MAP[rootId] || []; 
  },
  set: function(val) { 
    var rootId = getRootFolderId();
    DATA_MAP[rootId] = val; 
  }
});

/**
 * Convenience getter for structureLoaded
 */
Object.defineProperty(window, 'structureLoaded', {
  get: function() { 
    var rootId = getRootFolderId();
    return structureLoadedMap[rootId] || false; 
  },
  set: function(val) { 
    var rootId = getRootFolderId();
    structureLoadedMap[rootId] = val; 
  }
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
  var rootId = getRootFolderId();
  return 'drive_' + rootId.substring(0, 8) + '_';
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
  var rootId = getRootFolderId();
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
  delete DATA_MAP[rootId];
  delete structureLoadedMap[rootId];
  
  // Clear file/folder caches (keyed by folder ID, but we can't easily filter)
  // These will be repopulated on next fetch
  filesCache = {};
  foldersCache = {};
  
  var folderType = getFolderType(rootId);
  console.log('[DriveAPI] Cache cleared for', folderType);
}

/**
 * Gets the folder type name (Notes/Textbooks) from folder ID
 * @param {string} folderId - The folder ID
 * @returns {string} 'Notes' or 'Textbooks'
 */
function getFolderType(folderId) {
  var notesId = (window.CONFIG && window.CONFIG.NOTES_FOLDER_ID) || 'YOUR_NOTES_FOLDER_ID';
  var textbooksId = (window.CONFIG && window.CONFIG.TEXTBOOKS_FOLDER_ID) || 'YOUR_TEXTBOOKS_FOLDER_ID';
  
  if (folderId === notesId) return 'Notes';
  if (folderId === textbooksId) return 'Textbooks';
  return 'Unknown';
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
      console.log('[DriveAPI] Google API script loaded');
      window.gapi.load('client', function() {
        window.gapi.client.init({
          apiKey: getApiKey(),
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        }).then(function() {
          console.log('[DriveAPI] Google API client initialized');
          resolve();
        }, function(err) {
          console.error('[DriveAPI] Failed to initialize client:', err);
          reject(err);
        });
      });
    };
    
    script.onerror = function(err) {
      console.error('[DriveAPI] Failed to load Google API script:', err);
      reject(err);
    };
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
   AUTO-REFRESH HELPER FUNCTIONS
   ============================================================ */

/**
 * Gets cache data with age information
 * @param {string} key - Cache key (without prefix)
 * @returns {Object} Object with data, age, and timestamp
 */
function getCacheInfo(key) {
  var result = { data: null, age: null, timestamp: null };
  
  if (typeof cacheManager === 'undefined') {
    return result;
  }
  
  var cacheKey = 'enginotes_cache_' + key;
  
  try {
    var item = localStorage.getItem(cacheKey);
    if (!item) return result;
    
    var parsed = JSON.parse(item);
    result.data = parsed.value;
    result.timestamp = parsed.timestamp;
    result.age = Date.now() - parsed.timestamp;
  } catch (e) {
    // Ignore parse errors
  }
  
  return result;
}

/**
 * Flag to track if background refresh is in progress
 * @type {Object}
 */
var backgroundRefreshInProgress = {};

/**
 * Silently refreshes cache in the background without blocking UI
 * @param {string} rootId - Root folder ID to refresh
 */
async function silentBackgroundRefresh(rootId) {
  // Prevent multiple simultaneous refreshes for same folder
  if (backgroundRefreshInProgress[rootId]) {
    console.log('[DriveAPI] Background refresh already in progress for', rootId);
    return;
  }
  
  backgroundRefreshInProgress[rootId] = true;
  
  try {
    console.log('[DriveAPI] Starting silent background refresh...');
    
    // Clear only the structure cache for this root
    var structureCacheKey = 'drive_' + rootId.substring(0, 8) + '_structure';
    if (typeof cacheManager !== 'undefined') {
      cacheManager.remove(structureCacheKey);
    }
    
    // Fetch fresh data
    await loadGoogleAPI();
    
    var deptFolders = await fetchFolders(rootId);
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
    
    // Update cache and memory
    DATA_MAP[rootId] = data;
    setCachedData(getCacheKey('STRUCTURE'), data);
    
    console.log('[DriveAPI] Silent background refresh complete');
  } catch (error) {
    console.error('[DriveAPI] Background refresh failed:', error);
  } finally {
    backgroundRefreshInProgress[rootId] = false;
  }
}

/* ============================================================
   BUILD STRUCTURE FUNCTION
   ============================================================ */

/**
 * Builds the complete folder structure from Google Drive
 * Uses caching if available to reduce API calls
 * Auto-refreshes cache silently if older than AUTO_REFRESH_THRESHOLD
 * @returns {Promise<Array>} Complete data structure
 */
async function buildStructure() {
  var rootId = getRootFolderId();
  console.log('[DriveAPI] buildStructure called with rootId:', rootId);
  
  // Check if already loaded in memory for this ROOT_FOLDER_ID
  if (structureLoadedMap[rootId] && DATA_MAP[rootId] && DATA_MAP[rootId].length > 0) {
    console.log('[DriveAPI] Using in-memory structure');
    return DATA_MAP[rootId];
  }
  
  // Check localStorage cache for this ROOT_FOLDER_ID
  var structureCacheKey = getCacheKey('STRUCTURE');
  var cacheInfo = getCacheInfo(structureCacheKey);
  
  if (cacheInfo.data && cacheInfo.data.length > 0) {
    DATA_MAP[rootId] = cacheInfo.data;
    structureLoadedMap[rootId] = true;
    var folderType = getFolderType(rootId);
    console.log('[DriveAPI] Loaded from cache for', folderType, '- Age:', formatCacheAge(cacheInfo.age));
    
    // Auto-refresh in background if cache is stale
    if (cacheInfo.age > AUTO_REFRESH_THRESHOLD) {
      console.log('[DriveAPI] Cache is stale, triggering silent background refresh...');
      silentBackgroundRefresh(rootId);
    }
    
    return DATA_MAP[rootId];
  }
  
  // Fetch from API
  var folderType = getFolderType(rootId);
  console.log('[DriveAPI] Fetching from API for', folderType);
  
  try {
    await loadGoogleAPI();
  } catch (apiError) {
    console.error('[DriveAPI] Failed to load Google API:', apiError);
    throw apiError;
  }
  
  var deptFolders = await fetchFolders(rootId);
  console.log('[DriveAPI] Found', deptFolders.length, 'department folders');
  
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
  DATA_MAP[rootId] = data;
  structureLoadedMap[rootId] = true;
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
  var rootId = getRootFolderId();
  console.log('[DriveAPI] Refreshing structure...');
  
  // Clear cache for current ROOT_FOLDER_ID only
  clearCurrentCache();
  
  // Fetch fresh data from API
  await loadGoogleAPI();
  
  var deptFolders = await fetchFolders(rootId);
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
  DATA_MAP[rootId] = data;
  structureLoadedMap[rootId] = true;
  setCachedData(getCacheKey('STRUCTURE'), data);
  
  console.log('[DriveAPI] Structure refreshed and cached');
  
  return data;
}

/**
 * Gets the cache status for current ROOT_FOLDER_ID
 * @returns {Object} Cache status info
 */
function getCacheStatus() {
  var rootId = getRootFolderId();
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
    isFresh: cacheAge ? cacheAge < (getCacheTTL() / 2) : false,
    folderType: getFolderType(rootId)
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
