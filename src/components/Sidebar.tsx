import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Folder, FolderOpen, Plus, MoreVertical, Trash2, FolderInput, Edit, Check, X, Star } from 'lucide-react';
import type { BookmarkFolder } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  folders: BookmarkFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onToggleFolderExpanded: (folderId: string) => void;
  onCreateFolder: (name: string, parentId: string | null) => string;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveFolder: (folderId: string, parentId: string | null) => void;
  bookmarks: any[];
  isBatchMode: boolean;
  selectedFolderIds: string[];
  onToggleFolderSelection: (folderId: string) => void;
  onSelectAllFolders: () => void;
  onBatchDeleteFolders: () => void;
  onBatchMoveFolders: () => void;
  onExitFolderBatchMode: () => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  folders,
  selectedFolderId,
  onSelectFolder,
  onToggleFolderExpanded,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  bookmarks,
  isBatchMode,
  selectedFolderIds,
  onToggleFolderSelection,
  onSelectAllFolders,
  onBatchDeleteFolders,
  onBatchMoveFolders,
  onExitFolderBatchMode,
}: SidebarProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [folderToMove, setFolderToMove] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<string | null>(null);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [showDragConfirm, setShowDragConfirm] = useState(false);
  const [dragAction, setDragAction] = useState<'position' | 'hierarchy'>('position');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch gesture for swipe to open/close sidebar
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isSwiping.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      
      // Detect horizontal swipe (right swipe to open sidebar, left to close)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        isSwiping.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      
      if (isSwiping.current) {
        if (deltaX > 100 && !isOpen) {
          onToggle();
        } else if (deltaX < -100 && isOpen) {
          onToggle();
        }
      }
      isSwiping.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onToggle]);

  const handleRenameFolder = (folderId: string) => {
    if (editingFolderName.trim()) {
      onRenameFolder(folderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolderId(folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    
    if (!draggedFolderId) return;

    // Show confirmation dialog for drag action
    setDragAction(targetFolderId && draggedFolderId !== targetFolderId ? 'hierarchy' : 'position');
    setShowDragConfirm(true);

    setDraggedFolderId(null);
    setDragOverFolderId(null);
  };

  const confirmDragAction = () => {
    if (draggedFolderId && dragAction === 'hierarchy') {
      onMoveFolder(draggedFolderId, dragOverFolderId);
    }
    // For position, would need reordering logic
    setShowDragConfirm(false);
  };

  const handleLongPressStart = (folderId: string) => {
    longPressTimer.current = setTimeout(() => {
      setOpenMenuId(folderId);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Count bookmarks in folder
  const getBookmarkCount = (folderId: string) => {
    return bookmarks.filter(b => b.folderId === folderId).length;
  };

  const renderFolderTree = (parentId: string | null, level: number = 0): React.ReactElement[] => {
    return folders
      .filter(f => f.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(folder => {
        const isSelected = selectedFolderId === folder.id;
        const isEditing = editingFolderId === folder.id;
        const isDragOver = dragOverFolderId === folder.id;
        const isSelectedForBatch = selectedFolderIds.includes(folder.id);
        const bookmarkCount = getBookmarkCount(folder.id);
        const paddingLeft = level * 12 + 8;

        return (
          <div key={folder.id} className="select-none">
            <div
              className={cn(
                'flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200',
                'hover:bg-accent/60',
                isSelected && 'bg-accent/80 text-accent-foreground',
                isDragOver && 'bg-primary/10',
                isBatchMode && 'pl-1'
              )}
              style={{ paddingLeft }}
              draggable
              onDragStart={(e) => handleDragStart(e, folder.id)}
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder.id)}
              onClick={() => {
                if (isBatchMode) {
                  onToggleFolderSelection(folder.id);
                } else {
                  onSelectFolder(folder.id);
                }
              }}
              onMouseDown={() => handleLongPressStart(folder.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(folder.id)}
              onTouchEnd={handleLongPressEnd}
              onContextMenu={(e) => {
                e.preventDefault();
                setOpenMenuId(folder.id);
              }}
            >
              {/* Batch mode checkbox */}
              {isBatchMode && (
                <Checkbox
                  checked={isSelectedForBatch}
                  onCheckedChange={() => onToggleFolderSelection(folder.id)}
                  className="mr-1.5 h-4 w-4"
                />
              )}

              {/* Expand button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFolderExpanded(folder.id);
                }}
                className="p-0.5 rounded hover:bg-background/60 transition-colors flex-shrink-0"
              >
                {folder.isExpanded ? (
                  <ChevronRight className="w-[14px] h-[14px] rotate-90 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="w-[14px] h-[14px] transition-transform duration-200" />
                )}
              </button>
              
              {/* Folder icon */}
              {folder.isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
              )}
              
              {/* Folder name or abbreviation */}
              {isEditing ? (
                <Input
                  type="text"
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameFolder(folder.id);
                    if (e.key === 'Escape') {
                      setEditingFolderId(null);
                      setEditingFolderName('');
                    }
                  }}
                  className="flex-1 h-6 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm truncate">{folder.name}</span>
              )}
              
              {/* Bookmark count */}
              {bookmarkCount > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 rounded">{bookmarkCount}</span>
              )}
              
              {/* Folder actions - Three dots menu */}
              <DropdownMenu open={openMenuId === folder.id} onOpenChange={(open) => !open && setOpenMenuId(null)}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background/60 transition-all duration-200 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(folder.id);
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-44 rounded-xl border border-border/50 shadow-lg p-1.5"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuItem 
                    onClick={() => {
                      setShowAddDialog(folder.id);
                      setOpenMenuId(null);
                    }}
                    className="rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-accent/80"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加子文件夹
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setEditingFolderId(folder.id);
                      setEditingFolderName(folder.name);
                      setOpenMenuId(null);
                    }}
                    className="rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-accent/80"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setFolderToMove(folder.id);
                      setShowMoveDialog(true);
                      setOpenMenuId(null);
                    }}
                    className="rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-accent/80"
                  >
                    <FolderInput className="w-4 h-4 mr-2" />
                    移动
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem 
                    className="text-destructive rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-destructive/10"
                    onClick={() => {
                      onDeleteFolder(folder.id);
                      setOpenMenuId(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Show children if expanded */}
            {folder.isExpanded && (
              <div className="relative">
                {renderFolderTree(folder.id, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  // Get starred bookmarks count
  const starredCount = bookmarks.filter(b => b.starred).length;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed lg:relative h-full bg-card border-r border-border/50 transition-all duration-300 ease-out z-50',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'w-72 lg:w-64'
        )}
      >
        {/* Content */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-medium text-base">文件夹</h2>
            {isBatchMode && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSelectAllFolders}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  全选
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onBatchDeleteFolders}
                  disabled={selectedFolderIds.length === 0}
                  className="h-7 px-2 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  删除
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBatchMoveFolders}
                  disabled={selectedFolderIds.length === 0}
                  className="h-7 px-2 text-xs"
                >
                  <FolderInput className="w-3 h-3 mr-1" />
                  移动
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExitFolderBatchMode}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* My Favorites section */}
          <div className="p-3 border-b border-border/50">
            <button
              className={cn(
                'w-full flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all duration-200',
                'hover:bg-accent/50',
                selectedFolderId === 'starred' && 'bg-accent/70 text-accent-foreground'
              )}
              onClick={() => onSelectFolder('starred')}
            >
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm">我的收藏</span>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 rounded">{starredCount}</span>
            </button>
          </div>

          {/* Folder tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Root folder */}
            <div
              className={cn(
                'flex items-center gap-2.5 py-2 px-2 rounded-xl cursor-pointer transition-all duration-200 mb-2',
                'hover:bg-accent/50',
                selectedFolderId === 'root' && 'bg-accent/70 text-accent-foreground'
              )}
              onClick={() => onSelectFolder('root')}
            >
              <FolderOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="flex-1 text-sm">全部书签</span>
            </div>

            {/* Folder tree */}
            <div className="group">
              {renderFolderTree(null)}
            </div>
          </div>
        </div>
      </div>

      {/* Add subfolder dialog */}
      <Dialog open={!!showAddDialog} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">添加子文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="子文件夹名称"
              autoFocus
              className="rounded-lg"
            />
            <div className="text-xs text-muted-foreground">
              父文件夹: {showAddDialog ? folders.find(f => f.id === showAddDialog)?.name : ''}
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 rounded-lg" 
                onClick={() => {
                  if (newFolderName.trim() && showAddDialog) {
                    onCreateFolder(newFolderName.trim(), showAddDialog);
                    setNewFolderName('');
                    setShowAddDialog(null);
                  }
                }}
              >
                创建
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => {
                  setNewFolderName('');
                  setShowAddDialog(null);
                }}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move folder dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">移动到文件夹</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-3">选择一个目标文件夹：</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                onClick={() => {
                  if (folderToMove) onMoveFolder(folderToMove, null);
                  setShowMoveDialog(false);
                  setFolderToMove(null);
                }}
              >
                根目录
              </button>
              {folders
                .filter(f => f.id !== folderToMove)
                .map(folder => (
                  <button
                    key={folder.id}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-2"
                    onClick={() => {
                      if (folderToMove) onMoveFolder(folderToMove, folder.id);
                      setShowMoveDialog(false);
                      setFolderToMove(null);
                    }}
                  >
                    <Folder className="w-4 h-4 text-amber-500" />
                    {folder.name}
                  </button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drag confirm dialog */}
      <Dialog open={showDragConfirm} onOpenChange={setShowDragConfirm}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">拖拽操作确认</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              请选择拖拽操作类型：
            </p>
            <div className="flex gap-2">
              <Button
                variant={dragAction === 'position' ? 'default' : 'outline'}
                className="flex-1 rounded-lg"
                onClick={() => setDragAction('position')}
              >
                调整位置
              </Button>
              <Button
                variant={dragAction === 'hierarchy' ? 'default' : 'outline'}
                className="flex-1 rounded-lg"
                onClick={() => setDragAction('hierarchy')}
              >
                调整层级
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {dragAction === 'position' 
                ? '将调整文件夹在列表中的显示顺序' 
                : '将文件夹设为其他文件夹的子文件夹'}
            </p>
            <div className="flex gap-2">
              <Button 
                className="flex-1 rounded-lg" 
                onClick={() => {
                  confirmDragAction();
                  setShowDragConfirm(false);
                }}
              >
                确认
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => setShowDragConfirm(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


