import React, { useState } from 'react';
import { X, Folder, FolderOpen, ChevronRight } from 'lucide-react';
import type { Bookmark, BookmarkFolder } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MoveBookmarkDialogProps {
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
  folders: BookmarkFolder[];
  onMove: (bookmarkIds: string[], folderId: string) => void;
}

export function MoveBookmarkDialog({
  bookmarks,
  isOpen,
  onClose,
  folders,
  onMove,
}: MoveBookmarkDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleMove = () => {
    if (selectedFolderId) {
      onMove(bookmarks.map(b => b.id), selectedFolderId);
      onClose();
    }
  };

  const renderFolderTree = (parentId: string | null, level: number = 0): React.ReactElement[] => {
    return folders
      .filter(f => f.parentId === parentId)
      .map(folder => {
        const isSelected = selectedFolderId === folder.id;
        const paddingLeft = level * 16 + 8;

        return (
          <div key={folder.id} className="select-none">
            <div
              className={cn(
                'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent/50',
                isSelected && 'bg-accent text-accent-foreground'
              )}
              style={{ paddingLeft }}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              {folder.isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              )}
              <span className="flex-1 text-sm truncate">{folder.name}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
          </div>
        );
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-background rounded-xl shadow-2xl border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            移动到文件夹 ({bookmarks.length})
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto space-y-1">
          {renderFolderTree(null)}
        </div>

        <div className="flex gap-2 p-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            取消
          </Button>
          <Button
            className="flex-1"
            onClick={handleMove}
            disabled={!selectedFolderId}
          >
            移动
          </Button>
        </div>
      </div>
    </div>
  );
}
