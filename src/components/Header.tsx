import { Menu, Info, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useState } from 'react';

interface HeaderProps {
  title: string;
  isDark: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
}

export function Header({
  title,
  isDark,
  onToggleDarkMode,
  onToggleSidebar,
}: HeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center justify-center px-4 py-3 relative">
          {/* Left menu button */}
          <div className="absolute left-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="w-9 h-9 rounded-lg hover:bg-accent/50"
            >
              <Menu className="w-[18px] h-[18px]" />
            </Button>
          </div>

          {/* Center title with infinity symbol */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              {/* Infinity symbol logo */}
              <svg 
                className="w-7 h-7 text-primary" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2C6.5 2 4 6 4 8s2.5 6 8 6 8-4 8-6-2.5-6-8-6z" />
                <path d="M12 22c5.5 0 8-4 8-6s-2.5-6-8-6-8 4-8 6 2.5 6 8 6z" />
              </svg>
              {/* Artistic title */}
              <h1 
                className="text-xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                style={{
                  fontFamily: "'STXingkai', 'KaiTi', cursive",
                }}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* Right menu */}
          <div className="absolute right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="w-9 h-9 rounded-lg hover:bg-accent/50"
                >
                  <Menu className="w-[18px] h-[18px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-52 rounded-xl border border-border/50 shadow-lg p-1.5"
              >
                <DropdownMenuItem 
                  onClick={onToggleDarkMode}
                  className="rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-accent/50"
                >
                  {isDark ? (
                    <><Sun className="w-4 h-4 mr-2.5" />浅色模式</>
                  ) : (
                    <><Moon className="w-4 h-4 mr-2.5" />深色模式</>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem 
                  onClick={() => setInfoOpen(true)}
                  className="rounded-lg py-2 px-3 cursor-pointer transition-colors hover:bg-accent/50"
                >
                  <Info className="w-4 h-4 mr-2.5" />
                  操作说明
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">基本操作说明</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">网站操作</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 单击书签：选择/取消选择</li>
                <li>• 双击书签：打开链接</li>
                <li>• 长按书签：进入多选模式</li>
                <li>• 点击星标：设为收藏（靠前显示）</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">文件夹操作</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 右滑屏幕：唤出文件夹树</li>
                <li>• 左滑文件夹：返回主界面</li>
                <li>• 长按文件夹：编辑/添加子文件夹</li>
                <li>• 拖拽文件夹：调整位置或层级</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-foreground">多选操作</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 长按进入多选模式</li>
                <li>• 全选按钮：选择全部</li>
                <li>• 功能菜单：批量移动/删除</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                提示：网址输入时可省略 http:// 或 https://，系统会自动补全。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
