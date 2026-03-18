import { useState, useCallback } from 'react';
import type { Message, ChatSession, CozeWPAConfig } from '@/types/chat';
import { sendToCozeWPA, initCozeSession } from '@/services/cozeApi';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 从localStorage加载会话
const loadSession = (): ChatSession => {
  const saved = localStorage.getItem('ai-customer-service-session');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      console.warn('Failed to parse saved session');
    }
  }
  const { conversationId, corpUin } = initCozeSession();
  return {
    conversationId,
    corpUin,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

// 保存会话到localStorage
const saveSession = (session: ChatSession) => {
  localStorage.setItem('ai-customer-service-session', JSON.stringify(session));
};

export function useChat() {
  const [session, setSession] = useState<ChatSession>(loadSession);
  const [isLoading, setIsLoading] = useState(false);

  // 发送消息到扣子WPA节点
  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    // 创建用户消息
    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: Date.now(),
      status: 'sending'
    };

    // 更新会话
    const newSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: Date.now()
    };
    setSession(newSession);
    saveSession(newSession);

    setIsLoading(true);

    try {
      // 构建WPA请求参数
      const wpaConfig: CozeWPAConfig = {
        conversationId: session.conversationId,
        corpUin: session.corpUin || 'default_corp',
        robotHistory: session.messages,
        wpa: content
      };

      // 调用扣子WPA API
      const response = await sendToCozeWPA(wpaConfig);

      // 创建AI回复消息
      const assistantMessage: Message = {
        id: generateId(),
        content: response.output,
        role: 'assistant',
        timestamp: Date.now(),
        status: 'sent'
      };

      // 更新会话
      const updatedSession = {
        ...newSession,
        messages: [...newSession.messages.map(m => 
          m.id === userMessage.id ? { ...m, status: 'sent' as const } : m
        ), assistantMessage],
        updatedAt: Date.now()
      };
      setSession(updatedSession);
      saveSession(updatedSession);

    } catch (error) {
      // 标记消息发送失败
      const failedSession = {
        ...newSession,
        messages: newSession.messages.map(m => 
          m.id === userMessage.id ? { ...m, status: 'error' as const } : m
        )
      };
      setSession(failedSession);
      saveSession(failedSession);
      
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // 重新发送消息
  const retryMessage = useCallback(async (messageId: string) => {
    const message = session.messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      // 移除失败的消息及其后续消息
      const messageIndex = session.messages.findIndex(m => m.id === messageId);
      const cleanedSession = {
        ...session,
        messages: session.messages.slice(0, messageIndex)
      };
      setSession(cleanedSession);
      saveSession(cleanedSession);
      
      // 重新发送
      await sendMessage(message.content);
    }
  }, [session, sendMessage]);

  // 清空会话
  const clearSession = useCallback(() => {
    const { conversationId, corpUin } = initCozeSession(session.corpUin);
    const newSession: ChatSession = {
      conversationId,
      corpUin,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSession(newSession);
    saveSession(newSession);
  }, [session.corpUin]);

  // 设置企业UIN
  const setCorpUin = useCallback((corpUin: string) => {
    const newSession = { ...session, corpUin };
    setSession(newSession);
    saveSession(newSession);
  }, [session]);

  return {
    messages: session.messages,
    conversationId: session.conversationId,
    corpUin: session.corpUin,
    isLoading,
    sendMessage,
    retryMessage,
    clearSession,
    setCorpUin
  };
}
