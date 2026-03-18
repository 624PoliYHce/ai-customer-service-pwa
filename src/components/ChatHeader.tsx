import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bot, MoreVertical, Trash2, Download, Settings, Bell, BellOff } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChatHeaderProps {
  isOnline?: boolean;
  onClearChat?: () => void;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
  isInstalled?: boolean;
  notificationsEnabled?: boolean;
  onToggleNotifications?: () => void;
}

export function ChatHeader({
  isOnline = true,
  onClearChat,
  onInstallPWA,
  isInstallable,
  isInstalled,
  notificationsEnabled,
  onToggleNotifications
}: ChatHeaderProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleClearConfirm = () => {
    onClearChat?.();
    setShowClearDialog(false);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
        {/* 左侧：头像和状态 */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            {/* 在线状态指示器 */}
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              )}
            />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI智能客服</h1>
            <p className="text-xs text-gray-500">
              {isOnline ? '在线' : '离线'}
            </p>
          </div>
        </div>

        {/* 右侧：操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* 安装PWA */}
            {isInstallable && !isInstalled && (
              <DropdownMenuItem onClick={onInstallPWA}>
                <Download className="w-4 h-4 mr-2" />
                安装应用
              </DropdownMenuItem>
            )}
            
            {/* 通知开关 */}
            <DropdownMenuItem onClick={onToggleNotifications}>
              {notificationsEnabled ? (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  关闭通知
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  开启通知
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* 设置 */}
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              设置
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* 清空聊天 */}
            <DropdownMenuItem 
              onClick={() => setShowClearDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空对话
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* 清空确认对话框 */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空对话</DialogTitle>
            <DialogDescription>
              确定要清空所有对话记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleClearConfirm}>
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置对话框 */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>消息通知</Label>
                <p className="text-sm text-gray-500">接收新消息通知</p>
              </div>
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={onToggleNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>声音提示</Label>
                <p className="text-sm text-gray-500">新消息播放提示音</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
