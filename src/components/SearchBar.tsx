import React from 'react';
import { Search, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  tags: string[];
  onTagClick: (tag: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  tags,
  onTagClick,
  placeholder = "搜索书签...",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = React.useState(false);

  const handleTagClick = (tag: string) => {
    onTagClick(tag);
    setShowTagSuggestions(false);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'relative flex items-center gap-2 px-3 py-2 bg-background border rounded-lg transition-all',
          isFocused && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="p-1 rounded hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setShowTagSuggestions(!showTagSuggestions)}
          className={cn(
            'p-1.5 rounded transition-colors',
            showTagSuggestions ? 'bg-accent' : 'hover:bg-accent/50'
          )}
          title="按标签过滤"
        >
          <Tag className="w-4 h-4" />
        </button>
      </div>

      {/* Tag suggestions dropdown */}
      {showTagSuggestions && tags.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2 p-3 bg-popover border rounded-lg shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">点击标签快速过滤</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search tips */}
      {isFocused && !value && (
        <div className="absolute top-full left-0 right-0 z-20 mt-2 p-3 bg-popover border rounded-lg shadow-lg text-xs text-muted-foreground space-y-1">
          <p><strong>搜索提示：</strong></p>
          <p>• 输入关键词搜索标题和网址</p>
          <p>• 输入 <code className="bg-muted px-1 rounded">tag:标签名</code> 搜索特定标签</p>
        </div>
      )}
    </div>
  );
}
