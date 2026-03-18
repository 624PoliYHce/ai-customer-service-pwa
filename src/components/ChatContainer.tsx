import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { useChat } from '@/hooks/useChat';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    retryMessage,
    clearSession,
  } = useChat();

  const {
    isInstallable,
    isInstalled,
    installPWA,
    requestNotificationPermission,
    sendNotification,
  } = usePWA();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 监听新消息自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理滚动事件
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // 发送消息并通知
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    await sendMessage(content, attachments);
    
    // 如果开启了通知且页面不可见，发送通知
    if (notificationsEnabled && document.hidden) {
      sendNotification('AI智能客服', {
        body: content,
        tag: 'new-message'
      });
    }
  };

  // 切换通知
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
    }
  };

  // 欢迎消息
  const welcomeMessage = messages.length === 0;

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      {/* 头部 */}
      <ChatHeader
        isOnline={!isLoading}
        onClearChat={clearSession}
        onInstallPWA={installPWA}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* 消息列表 */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea
          className="h-full"
          onScroll={handleScroll}
        >
          <div className="pb-4">
            {/* 欢迎界面 */}
            {welcomeMessage && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  欢迎使用AI智能客服
                </h2>
                <p className="text-gray-500 max-w-sm mb-6">
                  我是您的智能助手，可以回答您的问题、提供帮助和建议。
                  请随时向我提问！
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['产品介绍', '价格咨询', '技术支持', '常见问题'].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRetry={retryMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 滚动到底部按钮 */}
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 输入框 */}
      <ChatInput
        onSend={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
