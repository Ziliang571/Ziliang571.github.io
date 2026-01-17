import { useState, useEffect } from 'react';
import { X, Link, Folder, Hash, Loader2, Plus } from 'lucide-react';
import type { BookmarkFolder } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AddBookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folders: BookmarkFolder[];
  selectedFolderId: string | null;
  onAddBookmark: (data: {
    url: string;
    title: string;
    icon: string;
    folderId: string;
    tags: string[];
    starred: boolean;
  }) => void;
  onCreateFolder: (name: string, parentId: string | null) => string;
}

export function AddBookmarkDialog({
  isOpen,
  onClose,
  folders,
  selectedFolderId,
  onAddBookmark,
  onCreateFolder,
}: AddBookmarkDialogProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [folderId, setFolderId] = useState(selectedFolderId || 'root');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setTitle('');
      setIcon('');
      setFolderId(selectedFolderId || 'root');
      setTagInput('');
      setSelectedTags([]);
      setIsLoading(false);
      setShowNewFolder(false);
    }
  }, [isOpen, selectedFolderId]);

  // Auto-fetch title and favicon
  const fetchSiteInfo = async (siteUrl: string) => {
    // Add protocol if not present
    if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
      siteUrl = 'https://' + siteUrl;
    }
    
    try {
      setIsLoading(true);
      
      // Try to get favicon
      const domain = new URL(siteUrl).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      setIcon(faviconUrl);
      
      // For now, extract title from URL or domain
      // In a real app, this would fetch the page title
      let titleFromUrl = '';
      try {
        titleFromUrl = domain.replace('www.', '').split('.')[0];
      } catch {
        titleFromUrl = '未知网站';
      }
      
      if (!title.trim()) {
        setTitle(titleFromUrl.charAt(0).toUpperCase() + titleFromUrl.slice(1));
      }
      
    } catch (error) {
      console.error('Failed to fetch site info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlBlur = () => {
    if (url && (!title || title === '未知网站')) {
      fetchSiteInfo(url);
    }
  };

  const handleAddTag = () => {
    const tagNames = tagInput.split(/\s+/).filter(t => t);
    setSelectedTags([...selectedTags, ...tagNames]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newId = onCreateFolder(newFolderName.trim(), newFolderParentId);
      setFolderId(newId);
      setShowNewFolder(false);
      setNewFolderName('');
      setNewFolderParentId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !folderId) return;

    // Auto add protocol if not present
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    // Validate URL
    try {
      new URL(finalUrl);
    } catch {
      alert('请输入有效的网址');
      return;
    }

    // Auto get title if not provided
    let finalTitle = title.trim();
    if (!finalTitle) {
      try {
        const domain = new URL(finalUrl).hostname;
        const nameFromDomain = domain.replace('www.', '').split('.')[0];
        finalTitle = nameFromDomain.charAt(0).toUpperCase() + nameFromDomain.slice(1);
      } catch {
        finalTitle = finalUrl;
      }
    }

    onAddBookmark({
      url: finalUrl,
      title: finalTitle,
      icon,
      folderId,
      tags: selectedTags,
      starred: false,
    });

    onClose();
  };

  if (!isOpen) return null;

  const folderOptions = folders.map(f => ({
    value: f.id,
    label: f.name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">添加书签</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              网址 *
            </label>
            <div className="relative">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="example.com 或 https://example.com"
                className="pr-10"
                required
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              可省略 http:// 或 https://，系统会自动补全
            </p>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="网站标题（留空自动获取）"
            />
            <p className="text-xs text-muted-foreground">
              留空将自动从网址提取
            </p>
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Folder className="w-4 h-4" />
              文件夹
            </label>
            <div className="flex gap-2">
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {folderOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewFolderParentId(null);
                  setShowNewFolder(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {showNewFolder && (
              <div className="space-y-2 mt-2 p-3 bg-muted rounded-lg">
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="新文件夹名称"
                  autoFocus
                />
                <select
                  value={newFolderParentId || ''}
                  onChange={(e) => setNewFolderParentId(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">根目录</option>
                  {folderOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleCreateFolder}>
                    创建
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewFolder(false);
                      setNewFolderName('');
                      setNewFolderParentId(null);
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              标签（选填）
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="输入标签，空格分隔"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                添加
              </Button>
            </div>
            
            {selectedTags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-background/50 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="flex-1">
              添加书签
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

