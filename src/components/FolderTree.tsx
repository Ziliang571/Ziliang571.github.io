import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from 'lucide-react';
import type { BookmarkFolder } from '@/types';
import { cn } from '@/lib/utils';

interface FolderTreeProps {
  folders: BookmarkFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onToggleExpanded: (folderId: string) => void;
  onCreateFolder: (name: string, parentId: string | null) => string;
  level?: number;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onToggleExpanded,
  onCreateFolder,
  level = 0,
}: FolderTreeProps) {
  const [newFolderParentId, setNewFolderParentId] = React.useState<string | null>(null);
  const [newFolderName, setNewFolderName] = React.useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderParentId);
      setNewFolderName('');
      setNewFolderParentId(null);
    }
  };

  const renderFolder = (folder: BookmarkFolder) => {
    const isSelected = selectedFolderId === folder.id;
    const paddingLeft = level * 12 + 8;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={cn(
            'flex items-center gap-1 py-2 px-2 rounded-lg cursor-pointer transition-colors',
            'hover:bg-accent/50',
            isSelected && 'bg-accent text-accent-foreground'
          )}
          style={{ paddingLeft }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(folder.id);
            }}
            className="p-0.5 rounded hover:bg-background/80"
          >
            {folder.isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {folder.isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          )}
          
          <span className="flex-1 text-sm truncate">{folder.name}</span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNewFolderParentId(folder.id);
            }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background/80 transition-opacity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Show children if expanded */}
        {folder.isExpanded && (
          <div className="relative">
            <FolderTree
              folders={folders.filter(f => f.parentId === folder.id)}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onToggleExpanded={onToggleExpanded}
              onCreateFolder={onCreateFolder}
              level={level + 1}
            />
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter(f => f.parentId === (level === 0 ? null : folders[0]?.parentId));

  return (
    <div className="space-y-0.5">
      {rootFolders.map(renderFolder)}
      
      {/* New folder input */}
      {newFolderParentId !== null && (
        <div className="px-2 py-1" style={{ paddingLeft: (level + 1) * 12 + 8 }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') {
                  setNewFolderName('');
                  setNewFolderParentId(null);
                }
              }}
              placeholder="文件夹名称..."
              className="flex-1 px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              创建
            </button>
            <button
              onClick={() => {
                setNewFolderName('');
                setNewFolderParentId(null);
              }}
              className="px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
