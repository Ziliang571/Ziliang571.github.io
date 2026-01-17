export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon: string;
  folderId: string;
  tags: string[];
  starred: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  parentId: string | null;
  isExpanded: boolean;
  createdAt: number;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AppState {
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  tags: Tag[];
  selectedFolderId: string | null;
  selectedBookmarkIds: string[];
  selectedFolderIds: string[];
  searchQuery: string;
  isBatchMode: boolean;
  isFolderBatchMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  folderDragMode: 'position' | 'hierarchy';
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface AddBookmarkData {
  url: string;
  title: string;
  icon: string;
  folderId: string;
  tags: string[];
}
