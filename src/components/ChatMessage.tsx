import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* 消息内容 */}
      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {/* 气泡 */}
        <div
          className={cn(
            'relative px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          )}
        >
          {message.content}
          
          {/* 错误提示 */}
          {isError && (
            <div className="flex items-center gap-2 mt-2 text-red-500 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>发送失败</span>
              <button
                onClick={() => onRetry?.(message.id)}
                className="flex items-center gap-1 underline hover:no-underline"
              >
                <RefreshCw className="w-3 h-3" />
                重试
              </button>
            </div>
          )}

          {/* 发送中状态 */}
          {message.status === 'sending' && (
            <div className="flex items-center gap-2 mt-2 opacity-70 text-xs">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>发送中...</span>
            </div>
          )}
        </div>

        {/* 时间戳 */}
        <span className="text-xs text-gray-400 mt-1 px-1">
          {format(message.timestamp, 'HH:mm', { locale: zhCN })}
        </span>
      </div>
    </div>
  );
}
