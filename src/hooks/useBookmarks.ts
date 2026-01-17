import { useState, useCallback, useMemo } from 'react';
import type { Bookmark, BookmarkFolder, AddBookmarkData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Generate sample data for demo
const generateSampleData = () => {
  const folders: BookmarkFolder[] = [
    { id: 'root', name: '全部书签', parentId: null, isExpanded: true, createdAt: Date.now(), order: 0 },
    { id: 'work', name: '工作', parentId: 'root', isExpanded: true, createdAt: Date.now(), order: 1 },
    { id: 'personal', name: '个人', parentId: 'root', isExpanded: false, createdAt: Date.now(), order: 2 },
    { id: 'dev', name: '开发', parentId: 'work', isExpanded: false, createdAt: Date.now(), order: 3 },
    { id: 'design', name: '设计', parentId: 'work', isExpanded: false, createdAt: Date.now(), order: 4 },
  ];

  const bookmarks: Bookmark[] = [
    {
      id: uuidv4(),
      title: 'GitHub',
      url: 'https://github.com',
      icon: 'https://github.com/favicon.ico',
      folderId: 'dev',
      tags: ['工具', '开发'],
      starred: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: uuidv4(),
      title: 'Figma',
      url: 'https://figma.com',
      icon: 'https://figma.com/favicon.ico',
      folderId: 'design',
      tags: ['工具', '设计'],
      starred: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: uuidv4(),
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      icon: 'https://stackoverflow.com/favicon.ico',
      folderId: 'dev',
      tags: ['学习', '参考'],
      starred: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  return { folders, bookmarks };
};

export function useBookmarks() {
  const [folders, setFolders] = useState<BookmarkFolder[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('infinity-folders');
      if (saved) return JSON.parse(saved);
    }
    return generateSampleData().folders;
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('infinity-bookmarks');
      if (saved) return JSON.parse(saved);
    }
    return generateSampleData().bookmarks;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>('root');
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);


  // Save to localStorage whenever data changes
  const saveToStorage = useCallback((newFolders: BookmarkFolder[], newBookmarks: Bookmark[]) => {
    localStorage.setItem('infinity-folders', JSON.stringify(newFolders));
    localStorage.setItem('infinity-bookmarks', JSON.stringify(newBookmarks));
  }, []);

  // Folder operations
  const toggleFolderExpanded = useCallback((folderId: string) => {
    setFolders(prev => {
      const newFolders = prev.map(f => 
        f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
      );
      saveToStorage(newFolders, bookmarks);
      return newFolders;
    });
  }, [bookmarks]);

  const createFolder = useCallback((name: string, parentId: string | null) => {
    const newFolder: BookmarkFolder = {
      id: uuidv4(),
      name,
      parentId,
      isExpanded: true,
      createdAt: Date.now(),
      order: Date.now(),
    };
    setFolders(prev => {
      const newFolders = [...prev, newFolder];
      saveToStorage(newFolders, bookmarks);
      return newFolders;
    });
    return newFolder.id;
  }, [bookmarks]);

  const renameFolder = useCallback((folderId: string, newName: string) => {
    setFolders(prev => {
      const newFolders = prev.map(f => 
        f.id === folderId ? { ...f, name: newName } : f
      );
      saveToStorage(newFolders, bookmarks);
      return newFolders;
    });
  }, [bookmarks]);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders(prev => {
      const newFolders = prev.filter(f => f.id !== folderId && f.parentId !== folderId);
      saveToStorage(newFolders, bookmarks);
      return newFolders;
    });
    setBookmarks(prev => {
      const newBookmarks = prev.filter(b => b.folderId !== folderId);
      saveToStorage(folders, newBookmarks);
      return newBookmarks;
    });
  }, [folders, bookmarks]);

  const moveFolder = useCallback((folderId: string, parentId: string | null) => {
    setFolders(prev => {
      const newFolders = prev.map(f => 
        f.id === folderId ? { ...f, parentId } : f
      );
      saveToStorage(newFolders, bookmarks);
      return newFolders;
    });
  }, [bookmarks]);

  // Bookmark operations
  const addBookmark = useCallback((data: AddBookmarkData) => {
    const newBookmark: Bookmark = {
      id: uuidv4(),
      title: data.title,
      url: data.url,
      icon: data.icon || `https://www.google.com/s2/favicons?domain=${new URL(data.url).hostname}`,
      folderId: data.folderId,
      tags: data.tags,
      starred: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setBookmarks(prev => {
      const newBookmarks = [...prev, newBookmark];
      saveToStorage(folders, newBookmarks);
      return newBookmarks;
    });
    return newBookmark;
  }, [folders]);

  const updateBookmark = useCallback((bookmarkId: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev => {
      const newBookmarks = prev.map(b => 
        b.id === bookmarkId ? { ...b, ...updates, updatedAt: Date.now() } : b
      );
      saveToStorage(folders, newBookmarks);
      return newBookmarks;
    });
  }, [folders]);

  const deleteBookmark = useCallback((bookmarkId: string | string[]) => {
    const ids = Array.isArray(bookmarkId) ? bookmarkId : [bookmarkId];
    setBookmarks(prev => {
      const newBookmarks = prev.filter(b => !ids.includes(b.id));
      saveToStorage(folders, newBookmarks);
      return newBookmarks;
    });
    setSelectedBookmarkIds(prev => prev.filter(id => !ids.includes(id)));
  }, [folders]);

  const moveBookmark = useCallback((bookmarkId: string | string[], folderId: string) => {
    const ids = Array.isArray(bookmarkId) ? bookmarkId : [bookmarkId];
    setBookmarks(prev => {
      const newBookmarks = prev.map(b => 
        ids.includes(b.id) ? { ...b, folderId, updatedAt: Date.now() } : b
      );
      saveToStorage(folders, newBookmarks);
      return newBookmarks;
    });
  }, [folders]);

  // Selection operations
  const toggleBookmarkSelection = useCallback((bookmarkId: string) => {
    setSelectedBookmarkIds(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  }, []);

  // Search and filtering
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;

    // Filter by folder
    if (selectedFolderId && selectedFolderId !== 'root') {
      const folderIds = new Set([selectedFolderId]);
      const addChildren = (parentId: string) => {
        folders.forEach(f => {
          if (f.parentId === parentId) {
            folderIds.add(f.id);
            addChildren(f.id);
          }
        });
      };
      addChildren(selectedFolderId);
      result = result.filter(b => folderIds.has(b.folderId));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const isTagSearch = query.startsWith('tag:');
      
      if (isTagSearch) {
        const tagName = query.slice(4).trim();
        result = result.filter(b => 
          b.tags.some(t => t.toLowerCase().includes(tagName))
        );
      } else {
        result = result.filter(b => 
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.tags.some(t => t.toLowerCase().includes(query))
        );
      }
    }

    // Sort: starred first, then by updated time
    result = result.sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return b.updatedAt - a.updatedAt;
    });

    return result;
  }, [bookmarks, selectedFolderId, searchQuery, folders]);

  const selectAllBookmarks = useCallback(() => {
    setSelectedBookmarkIds(filteredBookmarks.map(b => b.id));
  }, [filteredBookmarks]);

  const clearSelection = useCallback(() => {
    setSelectedBookmarkIds([]);
    setIsBatchMode(false);
  }, []);

  // Batch operations
  const toggleBatchMode = useCallback(() => {
    setIsBatchMode(prev => {
      if (prev) clearSelection();
      return !prev;
    });
  }, [clearSelection]);

  // Copy URL
  const copyUrl = useCallback(async (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark && navigator.clipboard) {
      await navigator.clipboard.writeText(bookmark.url);
    }
  }, [bookmarks]);

  // Get favicon
  const getFavicon = useCallback((url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  }, []);

  // Get folder tree
  const folderTree = useMemo(() => {
    const buildTree = (parentId: string | null): any[] => {
      return folders
        .filter(f => f.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(f => ({
          ...f,
          children: buildTree(f.id),
        }));
    };
    return buildTree(null);
  }, [folders]);

  return {
    folders,
    bookmarks,
    selectedFolderId,
    selectedBookmarkIds,
    searchQuery,
    isBatchMode,
    filteredBookmarks,
    folderTree,
    setSelectedFolderId,
    setSearchQuery,
    toggleFolderExpanded,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    moveBookmark,
    toggleBookmarkSelection,
    selectAllBookmarks,
    clearSelection,
    toggleBatchMode,
    copyUrl,
    getFavicon,
  };
}
