import React, { useState, useEffect } from 'react';
import { X, Link, Folder, Hash } from 'lucide-react';
import type { Bookmark, BookmarkFolder } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  folders: BookmarkFolder[];
  onUpdate: (id: string, data: Partial<Bookmark>) => void;
}

export function EditBookmarkDialog({
  bookmark,
  isOpen,
  onClose,
  folders,
  onUpdate,
}: EditBookmarkDialogProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [folderId, setFolderId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setFolderId(bookmark.folderId);
      setSelectedTags(bookmark.tags);
    }
  }, [bookmark]);

  const handleAddTag = () => {
    const tagNames = tagInput.split(/\s+/).filter(t => t);
    setSelectedTags([...selectedTags, ...tagNames]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmark) return;

    onUpdate(bookmark.id, {
      title,
      url,
      folderId,
      tags: selectedTags,
    });

    onClose();
  };

  if (!isOpen || !bookmark) return null;

  const folderOptions = folders.map(f => ({
    value: f.id,
    label: f.name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-background rounded-xl shadow-2xl border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">编辑书签</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="网站标题"
              required
            />
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              网址
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Folder className="w-4 h-4" />
              文件夹
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {folderOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              标签
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
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
