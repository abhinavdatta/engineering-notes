import { NextRequest, NextResponse } from 'next/server';
import type { GitHubFile } from '@/types';

// GitHub API configuration
const GITHUB_CONFIG = {
  repoOwner: process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'your-username',
  repoName: process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'engineering-notes',
  branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
};

interface GitHubApiResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';
    
    const { repoOwner, repoName } = GITHUB_CONFIG;
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Engineering-Notes-Platform',
        // Add GitHub token if available for higher rate limits
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Repository or path not found. Please check your GitHub configuration.',
          files: [] 
        }, { status: 404 });
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubApiResponse[] = await response.json();
    
    // Filter and format the files
    const files: GitHubFile[] = data.map(item => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      url: item.url,
      html_url: item.html_url,
      git_url: item.git_url,
      download_url: item.download_url,
      type: item.type,
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching GitHub contents:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch contents',
      files: [] 
    }, { status: 500 });
  }
}
