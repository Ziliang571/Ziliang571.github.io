import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Trash2, FolderInput, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { BookmarkList } from '@/components/BookmarkList';
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog';
import { EditBookmarkDialog } from '@/components/EditBookmarkDialog';
import { MoveBookmarkDialog } from '@/components/MoveBookmarkDialog';
import { Mascot } from '@/components/Mascot';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Bookmark } from '@/types';
import './App.css';

function App() {
  const { theme, isDark, setTheme } = useTheme();
  const {
    folders,
    bookmarks,
    selectedFolderId,
    selectedBookmarkIds,
    searchQuery,
    filteredBookmarks,
    setSelectedFolderId,
    setSearchQuery,
    toggleFolderExpanded,
    createFolder,
    renameFolder,
    deleteFolder,
    moveBookmark,
    toggleBookmarkSelection,
    selectAllBookmarks,
    clearSelection,
    addBookmark,
    updateBookmark,
    deleteBookmark,
  } = useBookmarks();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [movingBookmarks, setMovingBookmarks] = useState<Bookmark[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isFolderBatchMode, setIsFolderBatchMode] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'starred'>('all');

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach(b => b.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [bookmarks]);

  // Filter bookmarks based on view mode
  const displayBookmarks = useMemo(() => {
    let result = filteredBookmarks;
    if (viewMode === 'starred') {
      result = result.filter(b => b.starred);
    }
    return result;
  }, [filteredBookmarks, viewMode]);

  const toggleStar = useCallback((id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      updateBookmark(id, { starred: !bookmark.starred });
    }
  }, [bookmarks, updateBookmark]);

  const handleOpenUrl = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCopyUrl = useCallback(async (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark && navigator.clipboard) {
      await navigator.clipboard.writeText(bookmark.url);
      toast.success('链接已复制到剪贴板');
    }
  }, [bookmarks]);

  const handleEdit = useCallback((bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
  }, []);

  const handleMove = useCallback((id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      setMovingBookmarks([bookmark]);
    }
  }, [bookmarks]);

  const handleBatchMove = useCallback(() => {
    const bookmarksToMove = bookmarks.filter(b => selectedBookmarkIds.includes(b.id));
    setMovingBookmarks(bookmarksToMove);
  }, [bookmarks, selectedBookmarkIds]);

  const handleBatchDelete = useCallback(() => {
    if (selectedBookmarkIds.length === 0) {
      toast.error('请先选择书签');
      return;
    }
    deleteBookmark(selectedBookmarkIds);
    toast.success(`已删除 ${selectedBookmarkIds.length} 个书签`);
    setIsBatchMode(false);
    clearSelection();
  }, [selectedBookmarkIds, deleteBookmark, clearSelection]);

  const handleAddBookmark = useCallback((data: {
    url: string;
    title: string;
    icon: string;
    folderId: string;
    tags: string[];
    starred: boolean;
  }) => {
    addBookmark(data);
    toast.success('书签添加成功');
  }, [addBookmark]);

  const handleUpdateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    updateBookmark(id, updates);
    setEditingBookmark(null);
    toast.success('书签更新成功');
  }, [updateBookmark]);

  const handleMoveBookmarks = useCallback((bookmarkIds: string[], folderId: string) => {
    moveBookmark(bookmarkIds, folderId);
    setMovingBookmarks([]);
    clearSelection();
    toast.success('书签移动成功');
  }, [moveBookmark, clearSelection]);

  const handleToggleFolderSelection = useCallback((folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  }, []);

  const handleSelectAllFolders = useCallback(() => {
    setSelectedFolderIds(folders.map(f => f.id));
  }, [folders]);

  const handleBatchDeleteFolders = useCallback(() => {
    if (selectedFolderIds.length === 0) return;
    selectedFolderIds.forEach(id => deleteFolder(id));
    toast.success(`已删除 ${selectedFolderIds.length} 个文件夹`);
    setSelectedFolderIds([]);
    setIsFolderBatchMode(false);
  }, [selectedFolderIds, deleteFolder]);

  const handleBatchMoveFolders = useCallback(() => {
    toast.info('批量移动功能开发中');
  }, []);

  const enterBatchMode = useCallback(() => {
    setIsBatchMode(true);
  }, []);

  const exitBatchMode = useCallback(() => {
    setIsBatchMode(false);
    clearSelection();
  }, [clearSelection]);

  const exitFolderBatchMode = useCallback(() => {
    setIsFolderBatchMode(false);
    setSelectedFolderIds([]);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const handleTagClick = useCallback((tag: string) => {
    setSearchQuery(`tag:${tag}`);
  }, [setSearchQuery]);

  const handleSelectFolder = useCallback((folderId: string | null) => {
    if (folderId === 'starred') {
      setViewMode('starred');
      setSelectedFolderId(null);
    } else {
      setViewMode('all');
      setSelectedFolderId(folderId);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddDialogOpen(false);
        setEditingBookmark(null);
        setMovingBookmarks([]);
        setIsBatchMode(false);
        setIsFolderBatchMode(false);
        setSelectedFolderIds([]);
        clearSelection();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [clearSelection]);

  return (
    <div className={cn('min-h-screen bg-background', isDark && 'dark')}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={handleSelectFolder}
          onToggleFolderExpanded={toggleFolderExpanded}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          onMoveFolder={() => {}}
          bookmarks={bookmarks}
          isBatchMode={isFolderBatchMode}
          selectedFolderIds={selectedFolderIds}
          onToggleFolderSelection={handleToggleFolderSelection}
          onSelectAllFolders={handleSelectAllFolders}
          onBatchDeleteFolders={handleBatchDeleteFolders}
          onBatchMoveFolders={handleBatchMoveFolders}
          onExitFolderBatchMode={exitFolderBatchMode}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="无限"
            isDark={isDark}
            onToggleDarkMode={toggleDarkMode}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4">
              {/* View mode tabs */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setViewMode('all')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    viewMode === 'all' 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted/50 hover:bg-accent/50'
                  )}
                >
                  全部书签
                </button>
                <button
                  onClick={() => setViewMode('starred')}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    viewMode === 'starred' 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted/50 hover:bg-accent/50'
                  )}
                >
                  我的收藏
                  <span className="text-xs">({bookmarks.filter(b => b.starred).length})</span>
                </button>
              </div>

              {/* Quick tags filter */}
              {allTags.length > 0 && viewMode === 'all' && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-sm font-medium">快速标签</span>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      清除
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={cn(
                          'px-3 py-1 text-xs rounded-full transition-all duration-200',
                          searchQuery === `tag:${tag}`
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 hover:bg-accent/50'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmark list */}
              <BookmarkList
                bookmarks={displayBookmarks}
                isBatchMode={isBatchMode}
                selectedIds={selectedBookmarkIds}
                onToggleSelection={toggleBookmarkSelection}
                onSelectAll={selectAllBookmarks}
                onCopyUrl={handleCopyUrl}
                onEdit={handleEdit}
                onDelete={deleteBookmark}
                onMove={handleMove}
                onOpenUrl={handleOpenUrl}
                onToggleStar={toggleStar}
                onEnterBatchMode={enterBatchMode}
                onExitBatchMode={exitBatchMode}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Floating batch action menu for bookmarks */}
      {isBatchMode && selectedBookmarkIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-popover border border-border/50 rounded-full shadow-xl px-5 py-2.5 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">已选 {selectedBookmarkIds.length}</span>
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
              onClick={exitBatchMode}
              className="ml-1 hover:bg-accent/50 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating batch action menu for folders */}
      {isFolderBatchMode && selectedFolderIds.length > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-popover border border-border/50 rounded-full shadow-xl px-5 py-2.5 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">已选 {selectedFolderIds.length} 个文件夹</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBatchDeleteFolders}
              className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10 rounded-full px-3"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exitFolderBatchMode}
              className="ml-1 hover:bg-accent/50 rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <Mascot onClick={() => toast.info('你好！我是无限的吉祥物～')} />

      <Button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        size="icon"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <AddBookmarkDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onAddBookmark={handleAddBookmark}
        onCreateFolder={createFolder}
      />

      <EditBookmarkDialog
        bookmark={editingBookmark}
        isOpen={!!editingBookmark}
        onClose={() => setEditingBookmark(null)}
        folders={folders}
        onUpdate={handleUpdateBookmark}
      />

      <MoveBookmarkDialog
        bookmarks={movingBookmarks}
        isOpen={movingBookmarks.length > 0}
        onClose={() => setMovingBookmarks([])}
        folders={folders}
        onMove={handleMoveBookmarks}
      />

      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default App;
