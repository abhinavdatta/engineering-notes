/**
 * ============================================================
 * _WORKER.JS - Cloudflare Worker for API Proxying
 * ============================================================
 * Proxies Google Drive API requests to hide API key
 * ============================================================
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight request
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // API routes
    if (url.pathname.startsWith('/api/drive/')) {
      return handleDriveApi(request, env);
    }

    // Serve static assets (for Cloudflare Pages)
    return env.ASSETS.fetch(request);
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Handle Drive API proxy requests
 */
async function handleDriveApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Validate API key is configured - try multiple possible locations
  let apiKey = env.GOOGLE_DRIVE_API_KEY;

  // Debug: Log environment info (in production, check Cloudflare dashboard logs)
  if (!apiKey) {
    console.log('[Worker Debug] env object keys:', Object.keys(env));
    console.log('[Worker Debug] GOOGLE_DRIVE_API_KEY exists:', 'GOOGLE_DRIVE_API_KEY' in env);
    console.log('[Worker Debug] env.ASSETS exists:', 'ASSETS' in env);
    console.log('[Worker Debug] Full env object:', JSON.stringify(env, null, 2));

    return jsonError(500, 'Google Drive API key not configured. Please set GOOGLE_DRIVE_API_KEY in Cloudflare environment variables. Check Cloudflare dashboard logs for debugging info.');
  }

  // Extract API endpoint
  const endpoint = path.replace('/api/drive/', '');

  // Get query parameters
  const params = new URLSearchParams(url.search);
  const folderId = params.get('folderId');
  const fileId = params.get('fileId');
  const q = params.get('q');
  const orderBy = params.get('orderBy') || 'name';
  const fields = params.get('fields') || 'files(id,name,mimeType,webViewLink,size,createdTime,modifiedTime),nextPageToken';
  const pageSize = parseInt(params.get('pageSize') || '100', 10);
  const pageToken = params.get('pageToken');

  // Build Google Drive API URL
  let driveUrl;
  let driveOptions = {
    headers: {
      // Add Referer header to satisfy Google API key restrictions
      'Referer': url.origin || 'https://enginotes.pages.dev'
    },
  };

  switch (endpoint) {
    case 'list':
    case 'files':
      // Fetch files/folders in a folder
      if (!folderId) {
        return jsonError(400, 'folderId parameter required');
      }

      // Build query - use custom q if provided, otherwise use default folder query
      let query = q || `'${folderId}' in parents and trashed=false`;

      driveUrl = `https://www.googleapis.com/drive/v3/files`;
      driveUrl += `?key=${apiKey}`;
      driveUrl += `&q=${encodeURIComponent(query)}`;
      driveUrl += `&fields=${encodeURIComponent(fields)}`;
      driveUrl += `&orderBy=${encodeURIComponent(orderBy)}`;
      driveUrl += `&pageSize=${pageSize}`;
      if (pageToken) {
        driveUrl += `&pageToken=${pageToken}`;
      }
      break;

    case 'folder':
    case 'get':
      // Get folder/file metadata
      const id = fileId || folderId;
      if (!id) {
        return jsonError(400, 'fileId or folderId parameter required');
      }

      driveUrl = `https://www.googleapis.com/drive/v3/files/${id}`;
      driveUrl += `?key=${apiKey}`;
      driveUrl += `&fields=${encodeURIComponent(fields)}`;
      break;

    case 'search':
      // Search with custom query
      if (!q) {
        return jsonError(400, 'q parameter required for search');
      }

      driveUrl = `https://www.googleapis.com/drive/v3/files`;
      driveUrl += `?key=${apiKey}`;
      driveUrl += `&q=${encodeURIComponent(q)}`;
      driveUrl += `&fields=${encodeURIComponent(fields)}`;
      driveUrl += `&orderBy=${encodeURIComponent(orderBy)}`;
      driveUrl += `&pageSize=${pageSize}`;
      if (pageToken) {
        driveUrl += `&pageToken=${pageToken}`;
      }
      break;

    default:
      return jsonError(404, 'Unknown endpoint: ' + endpoint);
  }

  try {
    // Fetch from Google Drive API
    const driveResponse = await fetch(driveUrl, driveOptions);

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      return jsonError(
        driveResponse.status,
        'Google Drive API error: ' + errorText
      );
    }

    const data = await driveResponse.json();

    // Return response with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
      },
    });

  } catch (error) {
    return jsonError(500, 'Server error: ' + error.message);
  }
}

/**
 * Return JSON error response
 */
function jsonError(status, message) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}