import { useState, useRef, useEffect } from 'react';
import { Copy, Edit, Trash2, FolderInput, ExternalLink, Star, Check, X } from 'lucide-react';
import type { Bookmark } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isBatchMode: boolean;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onCopyUrl: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onMove: (id: string) => void;
  onOpenUrl: (url: string) => void;
  onToggleStar: (id: string) => void;
  onEnterBatchMode: () => void;
  onExitBatchMode: () => void;
}

export function BookmarkList({
  bookmarks,
  isBatchMode,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onCopyUrl,
  onEdit,
  onDelete,
  onMove,
  onOpenUrl,
  onToggleStar,
  onEnterBatchMode,
  onExitBatchMode,
}: BookmarkListProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; bookmark: Bookmark } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [doubleClickTimer, setDoubleClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sort bookmarks: starred first, then by updated time
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return b.updatedAt - a.updatedAt;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show batch menu when items are selected
  useEffect(() => {
    if (isBatchMode && selectedIds.length > 0) {
      setShowBatchMenu(true);
    } else {
      setShowBatchMenu(false);
    }
  }, [isBatchMode, selectedIds.length]);

  const handleClick = (bookmark: Bookmark) => {
    // Clear any existing timers
    if (doubleClickTimer) {
      clearTimeout(doubleClickTimer);
      setDoubleClickTimer(null);
    }

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (isBatchMode) {
      // In batch mode, single click toggles selection
      onToggleSelection(bookmark.id);
    } else {
      // Set double click timer
      const timer = setTimeout(() => {
        // Single click - select the item (don't open)
        onToggleSelection(bookmark.id);
        setDoubleClickTimer(null);
      }, 300);
      setDoubleClickTimer(timer);
    }
  };

  const handleDoubleClick = (bookmark: Bookmark) => {
    // Clear double click timer
    if (doubleClickTimer) {
      clearTimeout(doubleClickTimer);
      setDoubleClickTimer(null);
    }

    // Double click opens the URL
    onOpenUrl(bookmark.url);
  };

  const handleMouseDown = (bookmark: Bookmark) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }

    const timer = setTimeout(() => {
      // Long press - enter batch mode and select this item
      if (!isBatchMode) {
        onEnterBatchMode();
      }
      onToggleSelection(bookmark.id);
      setLongPressTimer(null);
    }, 500);

    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.preventDefault();
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Adjust if menu would go off screen
    if (x + 200 > rect.width) x = rect.width - 210;
    if (y + 200 > rect.height) y = rect.height - 210;
    
    setContextMenu({ x, y, bookmark });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => onDelete(id));
    onExitBatchMode();
  };

  const handleBatchMove = () => {
    if (selectedIds.length === 0) return;
    // Move first selected item (in real app, would batch move all)
    onMove(selectedIds[0]);
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <img 
          src="/empty-bookmarks.png" 
          alt="Empty bookmarks" 
          className="w-48 h-48 mb-4 opacity-60 empty-float"
        />
        <p className="text-lg font-medium">暂无书签</p>
        <p className="text-sm mt-1">点击右下角 + 按钮添加第一个书签</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="relative">
      {/* Batch mode header */}
      {isBatchMode && (
        <div className="sticky top-0 z-10 flex items-center gap-4 p-3 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <Checkbox
            checked={selectedIds.length === sortedBookmarks.length}
            onCheckedChange={(checked) => {
              if (checked) onSelectAll();
              else selectedIds.forEach(id => onToggleSelection(id));
            }}
          />
          <span className="text-sm text-muted-foreground">
            已选择 {selectedIds.length} 项
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExitBatchMode}
              className="rounded-lg h-8"
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* Floating batch action menu */}
      {showBatchMenu && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-popover border border-border/50 rounded-full shadow-xl px-5 py-2.5 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">已选 {selectedIds.length}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBatchMove}
              className="flex items-center gap-1.5 hover:bg-accent/50 rounded-full px-3"
            >
              <FolderInput className="w-4 h-4" />
              移动
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10 rounded-full px-3"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExitBatchMode}
              className="ml-1 hover:bg-accent/50 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bookmark list */}
      <div className="divide-y divide-border/30">
        {sortedBookmarks.map((bookmark) => {
          const isSelected = selectedIds.includes(bookmark.id);
          
          return (
            <div
              key={bookmark.id}
              className={cn(
                'group relative flex items-center gap-3 p-3 transition-all duration-200',
                'hover:bg-accent/30',
                isSelected && 'bg-accent/40'
              )}
              onClick={() => handleClick(bookmark)}
              onDoubleClick={() => handleDoubleClick(bookmark)}
              onMouseDown={() => handleMouseDown(bookmark)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => handleContextMenu(e, bookmark)}
            >
              {/* Checkbox for batch mode */}
              {isBatchMode && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection(bookmark.id)}
                  className="mr-2"
                />
              )}

              {/* Favicon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center shadow-sm">
                {bookmark.icon ? (
                  <img 
                    src={bookmark.icon} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}`;
                    }}
                  />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {bookmark.title.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{bookmark.title}</h3>
                  {/* Star icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(bookmark.id);
                    }}
                    className={cn(
                      'p-1 rounded-lg transition-all duration-200',
                      bookmark.starred 
                        ? 'text-yellow-500 hover:text-yellow-400' 
                        : 'text-muted-foreground hover:text-yellow-500 hover:bg-accent/50'
                    )}
                  >
                    <Star className={cn('w-4 h-4', bookmark.starred && 'fill-current')} />
                  </button>
                </div>
                
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary truncate block transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Don't open here, use double click
                  }}
                >
                  {bookmark.url}
                </a>
                
                {/* Tags */}
                {bookmark.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md">
                        {tag}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md">
                        +{bookmark.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={cn(
                'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200',
                isBatchMode && 'opacity-100'
              )}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenUrl(bookmark.url);
                  }}
                  className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  title="打开链接"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-48 bg-popover border border-border/50 rounded-xl shadow-xl py-1.5 backdrop-blur-sm"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              onOpenUrl(contextMenu.bookmark.url);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors rounded-lg mx-1.5 w-[calc(100%-12px)]"
          >
            <ExternalLink className="w-4 h-4" />
            打开链接
          </button>
          <button
            onClick={() => {
              onCopyUrl(contextMenu.bookmark.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors rounded-lg mx-1.5 w-[calc(100%-12px)]"
          >
            <Copy className="w-4 h-4" />
            复制链接
          </button>
          <button
            onClick={() => {
              onEdit(contextMenu.bookmark);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors rounded-lg mx-1.5 w-[calc(100%-12px)]"
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={() => {
              onMove(contextMenu.bookmark.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors rounded-lg mx-1.5 w-[calc(100%-12px)]"
          >
            <FolderInput className="w-4 h-4" />
            移动
          </button>
          <hr className="my-1 border-border/30 mx-1.5" />
          <button
            onClick={() => {
              if (!isBatchMode) onEnterBatchMode();
              onToggleSelection(contextMenu.bookmark.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent/50 transition-colors rounded-lg mx-1.5 w-[calc(100%-12px)]"
          >
            <Check className="w-4 h-4" />
            多选
          </button>
          <button
            onClick={() => {
              onDelete(contextMenu.bookmark.id);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg mx-1.5 w-[calc(100%-12px)]"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      )}
    </div>
  );
}
