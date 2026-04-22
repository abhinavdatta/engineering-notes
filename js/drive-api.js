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
 * - User can clear cache by declining cookies
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
 * @type {Object}
 */
var filesCache = {};

/**
 * Memory cache for folder structure (session-only, no consent needed)
 * @type {Object}
 */
var foldersCache = {};

/**
 * Flag to track if structure has been loaded
 * @type {boolean}
 */
var structureLoaded = false;

/**
 * Main data structure holding all folders/files
 * @type {Array}
 */
var DATA = [];

/* ============================================================
   CACHE KEYS
   ============================================================ */
var CACHE_KEYS = {
  STRUCTURE: 'drive_structure_',
  FOLDERS: 'drive_folders_',
  FILES: 'drive_files_',
  TIMESTAMP: 'drive_cache_timestamp'
};

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
 * @param {string} key - Cache key
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
 * @param {string} key - Cache key
 * @param {*} value - Data to cache
 */
function setCachedData(key, value) {
  if (typeof cacheManager !== 'undefined' && cacheManager.isAvailable()) {
    cacheManager.set(key, value, CACHE_TTL);
  }
}

/**
 * Clears all Drive-related cache
 */
function clearDriveCache() {
  if (typeof cacheManager !== 'undefined') {
    // Clear all drive_ prefixed items
    cacheManager.clear();
  }
  // Also clear memory cache
  filesCache = {};
  foldersCache = {};
  structureLoaded = false;
  DATA = [];
  console.log('[DriveAPI] Cache cleared');
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
  // Check memory cache first (fastest)
  if (foldersCache[parentId]) {
    return foldersCache[parentId];
  }
  
  // Check localStorage cache (if consent given)
  var cacheKey = CACHE_KEYS.FOLDERS + parentId;
  var cached = getCachedData(cacheKey);
  if (cached) {
    foldersCache[parentId] = cached;
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
  foldersCache[parentId] = allFolders;
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
  // Check memory cache first
  var memCacheKey = parentId + '_direct';
  if (filesCache[memCacheKey]) {
    return filesCache[memCacheKey];
  }
  
  // Check localStorage cache
  var cacheKey = CACHE_KEYS.FILES + parentId;
  var cached = getCachedData(cacheKey);
  if (cached) {
    filesCache[memCacheKey] = cached;
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
  filesCache[memCacheKey] = allFiles;
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
  // Check memory cache first
  if (foldersCache[folderId] && filesCache[folderId + '_direct']) {
    return {
      folders: foldersCache[folderId],
      files: filesCache[folderId + '_direct']
    };
  }
  
  // Fetch folders and files in parallel
  var [folders, files] = await Promise.all([
    fetchFolders(folderId),
    fetchFiles(folderId)
  ]);
  
  return { folders, files };
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
   LOAD FILES FROM FOLDER FUNCTION (Legacy - includes subfolders)
   ============================================================ */

/**
 * Loads all files from a folder, including from subfolders
 * Uses caching if available
 * @param {string} folderId - The folder ID to load from
 * @returns {Promise<Array>} Array of file objects
 */
async function loadFilesFromFolder(folderId) {
  // Check memory cache
  if (filesCache[folderId]) {
    return filesCache[folderId];
  }
  
  // Check localStorage cache
  var cacheKey = CACHE_KEYS.FILES + folderId + '_all';
  var cached = getCachedData(cacheKey);
  if (cached) {
    filesCache[folderId] = cached;
    return cached;
  }
  
  await loadGoogleAPI();
  
  var allFiles = [];
  var pageToken = null;
  var items = [];
  
  do {
    var params = {
      q: "'" + folderId + "' in parents and trashed = false",
      orderBy: 'name',
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 1000
    };
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    var response = await window.gapi.client.drive.files.list(params);
    items = items.concat(response.result.files || []);
    pageToken = response.result.nextPageToken;
    
  } while (pageToken);
  
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      var subPageToken = null;
      do {
        var subParams = {
          q: "'" + item.id + "' in parents and trashed = false",
          orderBy: 'name',
          fields: 'nextPageToken, files(id, name)',
          pageSize: 1000
        };
        
        if (subPageToken) {
          subParams.pageToken = subPageToken;
        }
        
        var subResponse = await window.gapi.client.drive.files.list(subParams);
        var subFiles = subResponse.result.files || [];
        
        subFiles.forEach(function(s) {
          allFiles.push({
            id: s.id,
            name: s.name,
            parentFolder: item.name
          });
        });
        
        subPageToken = subResponse.result.nextPageToken;
      } while (subPageToken);
    } else {
      allFiles.push({
        id: item.id,
        name: item.name
      });
    }
  }
  
  var result = allFiles.map(function(item) {
    var type = 'NOTES';
    if (item.name.toLowerCase().includes('question') || item.name.toLowerCase().includes('qp')) {
      type = 'QP';
    } else if (item.name.toLowerCase().includes('lab')) {
      type = 'LAB';
    }
    
    return {
      id: item.id,
      title: item.name.replace(/\.[^/.]+$/, ''),
      type: type,
      fileName: item.name,
      parentFolder: item.parentFolder || '',
      driveUrl: 'https://drive.google.com/file/d/' + item.id + '/preview'
    };
  });
  
  // Cache results
  filesCache[folderId] = result;
  setCachedData(cacheKey, result);
  
  return result;
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
  // Check if already loaded in memory
  if (structureLoaded && DATA.length > 0) {
    return DATA;
  }
  
  // Check localStorage cache for entire structure
  var structureCacheKey = CACHE_KEYS.STRUCTURE + ROOT_FOLDER_ID;
  var cachedStructure = getCachedData(structureCacheKey);
  
  if (cachedStructure && cachedStructure.length > 0) {
    DATA = cachedStructure;
    structureLoaded = true;
    console.log('[DriveAPI] Loaded structure from cache - saved API calls!');
    return DATA;
  }
  
  // Fetch from API
  console.log('[DriveAPI] Fetching structure from API...');
  await loadGoogleAPI();
  
  var deptFolders = await fetchFolders(ROOT_FOLDER_ID);
  DATA = [];
  
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
    
    DATA.push(deptData);
  }
  
  // Cache the complete structure
  setCachedData(structureCacheKey, DATA);
  
  structureLoaded = true;
  console.log('[DriveAPI] Structure built and cached');
  return DATA;
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
 * Clears all cache and fetches fresh data
 * @returns {Promise<Array>} Fresh data structure
 */
async function refreshStructure() {
  console.log('[DriveAPI] Refreshing structure...');
  
  // Clear all caches
  filesCache = {};
  foldersCache = {};
  structureLoaded = false;
  DATA = [];
  
  // Clear localStorage cache for this folder
  if (typeof cacheManager !== 'undefined' && cacheManager.isAvailable()) {
    var structureCacheKey = CACHE_KEYS.STRUCTURE + ROOT_FOLDER_ID;
    cacheManager.remove(structureCacheKey);
    
    // Also clear folder and file caches
    // We need to iterate and remove matching keys
    for (var i = localStorage.length - 1; i >= 0; i--) {
      var key = localStorage.key(i);
      if (key && (
        key.startsWith('enginotes_cache_drive_folders_') ||
        key.startsWith('enginotes_cache_drive_files_')
      )) {
        localStorage.removeItem(key);
      }
    }
  }
  
  // Fetch fresh data from API
  await loadGoogleAPI();
  
  var deptFolders = await fetchFolders(ROOT_FOLDER_ID);
  DATA = [];
  
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
    
    DATA.push(deptData);
  }
  
  // Cache the fresh structure
  var structureCacheKey = CACHE_KEYS.STRUCTURE + ROOT_FOLDER_ID;
  setCachedData(structureCacheKey, DATA);
  
  structureLoaded = true;
  console.log('[DriveAPI] Structure refreshed and cached');
  
  return DATA;
}

/**
 * Gets the cache status
 * @returns {Object} Cache status info
 */
function getCacheStatus() {
  var structureCacheKey = CACHE_KEYS.STRUCTURE + ROOT_FOLDER_ID;
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
    isFresh: cacheAge ? cacheAge < (CACHE_TTL / 2) : false
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
