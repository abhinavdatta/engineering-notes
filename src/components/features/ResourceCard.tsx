'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, BookOpen, ClipboardList, FlaskConical, Paperclip } from 'lucide-react';
import type { Resource, ResourceType } from '@/types';
import { useAppStore } from '@/lib/store';
import { RESOURCE_TYPES } from '@/lib/constants';

interface ResourceCardProps {
  resource: Resource;
  departmentColor?: string;
}

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  NOTES: <FileText className="h-4 w-4" />,
  TEXTBOOK: <BookOpen className="h-4 w-4" />,
  QUESTION_PAPER: <ClipboardList className="h-4 w-4" />,
  LAB_MANUAL: <FlaskConical className="h-4 w-4" />,
  OTHER: <Paperclip className="h-4 w-4" />,
};

export function ResourceCard({ resource, departmentColor = '#3B82F6' }: ResourceCardProps) {
  const openPdfViewer = useAppStore((state) => state.openPdfViewer);
  const resourceType = RESOURCE_TYPES[resource.type];

  const handleView = () => {
    openPdfViewer(resource);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resource.githubUrl) {
      window.open(resource.githubUrl, '_blank');
    } else {
      // Construct GitHub raw URL
      const { repoOwner, repoName, branch } = {
        repoOwner: process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER || 'your-username',
        repoName: process.env.NEXT_PUBLIC_GITHUB_REPO_NAME || 'engineering-notes',
        branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
      };
      const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${resource.filePath}`;
      window.open(rawUrl, '_blank');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: resourceType.color }}
          >
            {RESOURCE_ICONS[resource.type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {resource.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs"
                style={{ 
                  borderColor: resourceType.color,
                  color: resourceType.color 
                }}
              >
                {resourceType.icon} {resourceType.label}
              </Badge>
              {resource.fileSize && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(resource.fileSize)}
                </span>
              )}
            </div>
            {resource.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {resource.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleView}
              className="h-8 w-8"
              title="View PDF"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
