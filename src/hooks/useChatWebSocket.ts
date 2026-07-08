"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
const VOICE_MESSAGE_PREFIX = "__voice_message__:";
const PHOTO_MESSAGE_PREFIX = "__photo_message__:";
const VIDEO_MESSAGE_PREFIX = "__video_message__:";
const CHAT_THEME_MESSAGE_PREFIX = "__chat_theme__:";
const GIF_MESSAGE_PREFIX = "__gif_message__:";

function messagePreview(content: string) {
 if (content.startsWith(CHAT_THEME_MESSAGE_PREFIX)) return "Chat theme changed";
 if (content.startsWith(VOICE_MESSAGE_PREFIX)) return "Voice message";
 if (content.startsWith(PHOTO_MESSAGE_PREFIX)) return "Photo";
 if (content.startsWith(VIDEO_MESSAGE_PREFIX)) return "Video";
 if (content.startsWith(GIF_MESSAGE_PREFIX)) return "GIF";
 return content;
}

export interface Message {
 id: string;
 conversationId: string;
 senderId: string;
 receiverId: string;
 content: string;
 reactions?: string;
 deletedForUserIds?: string | null;
 deletedForEveryone?: boolean;
 pinnedByUserIds?: string | null;
 starredByUserIds?: string | null;
 replyToMessageId?: string | null;
 isRead: boolean;
 createdAt: string;
 editedAt?: string | null;
 deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
 clientId?: string;
}

export function useChatWebSocket(token: string, conversationId: string | null) {
 const [socket, setSocket] = useState<Socket | null>(null);
 const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
 const [recordingUsers, setRecordingUsers] = useState<Record<string, boolean>>({});
 const queryClient = useQueryClient();
 const activeConversationRef = useRef(conversationId);
 const currentUserIdRef = useRef('');
 const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
 const recordingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

 useEffect(() => {
 activeConversationRef.current = conversationId;
 }, [conversationId]);

 useEffect(() => {
 if (!token) return;

 let userId = '';
 try {
 const payload = JSON.parse(atob(token.split('.')[1]));
 userId = String(payload.sub || payload.userId);
 currentUserIdRef.current = userId;
 } catch (e) {
 console.error('Failed to parse token for websocket', e);
 }

 // Connect to websocket with token
 const newSocket = io(SOCKET_URL, {
 auth: { token },
 query: { userId, token },
 });

 setSocket(newSocket);

 newSocket.on('connect', () => {
 console.log('Connected to chat server');
 });

 newSocket.on('receiveMessage', (message: Message) => {
 // Optimistically update query cache
 queryClient.setQueryData(['messages', message.conversationId], (old: Message[] | undefined) => {
 if (!old) return [{ ...message, deliveryStatus: message.deliveryStatus || (String(message.senderId) === userId ? 'sent' : undefined) }];
 // Prevent duplicates
 if (old.find(m => m.id === message.id)) return old;
 const withoutMatchingPending = old.filter((m) => {
   if (m.deliveryStatus !== 'sending') return true;
   return !(m.content === message.content && String(m.receiverId) === String(message.receiverId));
 });
 return [...withoutMatchingPending, { ...message, deliveryStatus: message.deliveryStatus || (String(message.senderId) === userId ? 'sent' : undefined) }];
 });

 // Update matches cache to bump it to the top
 queryClient.setQueryData(['matches', 'active'], (oldMatches: any) => {
 if (!oldMatches) return oldMatches;
 const updated = oldMatches.map((match: any) => {
 if (match.id === message.conversationId) {
 return {
 ...match,
 lastMessage: messagePreview(message.content),
 lastMessageTime: message.createdAt,
 // Only increment unread if we are not the sender and not actively viewing this conversation
 unreadCount: (String(message.senderId) === userId || activeConversationRef.current === message.conversationId) 
 ? match.unreadCount 
 : (match.unreadCount || 0) + 1
 };
 }
 return match;
 });
 return updated.sort((a: any, b: any) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
 });

 // If we are actively viewing this conversation, mark the message as read immediately
 if (activeConversationRef.current === message.conversationId && String(message.senderId) !== userId) {
 newSocket.emit('markMessagesRead', { conversationId: message.conversationId });
 fetch(`${API_URL}/messages/${message.conversationId}/read`, {
 method: 'PATCH',
 headers: { Authorization: `Bearer ${token}` }
 }).catch(() => {});
 }
 });

 newSocket.on('typingStatus', (payload: { conversationId?: string; userId: string; isTyping: boolean }) => {
   if (!payload.conversationId || String(payload.userId) === userId) return;
   setTypingUsers((current) => ({ ...current, [payload.conversationId!]: payload.isTyping }));
   if (typingTimersRef.current[payload.conversationId]) clearTimeout(typingTimersRef.current[payload.conversationId]);
   if (payload.isTyping) {
     typingTimersRef.current[payload.conversationId] = setTimeout(() => {
       setTypingUsers((current) => ({ ...current, [payload.conversationId!]: false }));
     }, 2500);
   }
 });

 newSocket.on('recordingStatus', (payload: { conversationId?: string; userId: string; isRecording: boolean }) => {
   if (!payload.conversationId || String(payload.userId) === userId) return;
   setRecordingUsers((current) => ({ ...current, [payload.conversationId!]: payload.isRecording }));
   if (recordingTimersRef.current[payload.conversationId]) clearTimeout(recordingTimersRef.current[payload.conversationId]);
   if (payload.isRecording) {
     recordingTimersRef.current[payload.conversationId] = setTimeout(() => {
       setRecordingUsers((current) => ({ ...current, [payload.conversationId!]: false }));
     }, 3500);
   }
 });

 newSocket.on('messagesRead', (payload: { conversationId: string; messageIds: string[] }) => {
   queryClient.setQueryData(['messages', payload.conversationId], (old: Message[] | undefined) => {
     if (!old) return old;
     const readIds = new Set(payload.messageIds);
     return old.map((message) => readIds.has(message.id) ? { ...message, isRead: true, deliveryStatus: 'seen' } : message);
   });
 });

 newSocket.on('USER_STATUS_CHANGED', (payload: { userId: string, isOnline: boolean, lastSeen?: string }) => {
   queryClient.setQueryData(['matches', 'active'], (oldMatches: any) => {
     if (!oldMatches) return oldMatches;
     return oldMatches.map((match: any) => {
       if (match.sender?.id === payload.userId) {
         return { ...match, sender: { ...match.sender, isOnline: payload.isOnline, lastSeen: payload.lastSeen } };
       } else if (match.receiver?.id === payload.userId) {
         return { ...match, receiver: { ...match.receiver, isOnline: payload.isOnline, lastSeen: payload.lastSeen } };
       }
       return match;
     });
   });
 });

 newSocket.on('messageReactionChanged', (payload: { messageId: string; conversationId: string; reactions: Record<string, string[]> }) => {
   queryClient.setQueryData(['messages', payload.conversationId], (old: Message[] | undefined) => {
     if (!old) return old;
     return old.map(m => {
       if (m.id === payload.messageId) {
         return { ...m, reactions: JSON.stringify(payload.reactions) };
       }
       return m;
     });
   });
 });

 newSocket.on('messageUpdated', (message: Message) => {
   queryClient.setQueryData(['messages', message.conversationId], (old: Message[] | undefined) => {
     if (!old) return old;
     return old.map((current) => current.id === message.id ? { ...current, ...message } : current);
   });
 });

 newSocket.on('messageMetaChanged', (message: Message) => {
   queryClient.setQueryData(['messages', message.conversationId], (old: Message[] | undefined) => {
     if (!old) return old;
     return old.map((current) => current.id === message.id ? { ...current, ...message } : current);
   });
 });

 newSocket.on('messageDeleted', (payload: { message: Message; scope: 'me' | 'everyone'; userId: string }) => {
   queryClient.setQueryData(['messages', payload.message.conversationId], (old: Message[] | undefined) => {
     if (!old) return old;
     if (payload.scope === 'me' && String(payload.userId) === userId) {
       return old.filter((message) => message.id !== payload.message.id);
     }
     return old.map((current) => current.id === payload.message.id ? { ...current, ...payload.message } : current);
   });
 });

 return () => {
 Object.values(typingTimersRef.current).forEach(clearTimeout);
 Object.values(recordingTimersRef.current).forEach(clearTimeout);
 newSocket.disconnect();
 };
 }, [token, queryClient]);

 // Fetch initial messages for a conversation
 const { data: messages = [], isLoading } = useQuery({
 queryKey: ['messages', conversationId],
 queryFn: async () => {
 if (!conversationId || !token) return [];
 const res = await fetch(`${API_URL}/messages/${conversationId}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 if (!res.ok) throw new Error('Failed to fetch messages');
 return res.json();
 },
 enabled: !!conversationId && !!token,
 });

 const sendMessage = useCallback((receiverId: string, content: string, replyToMessageId?: string | null) => {
 if (socket && conversationId) {
 const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
 const pendingMessage: Message = {
   id: clientId,
   clientId,
   conversationId,
   senderId: currentUserIdRef.current,
   receiverId,
   content,
   reactions: undefined,
   replyToMessageId: replyToMessageId || null,
   isRead: false,
   createdAt: new Date().toISOString(),
   deliveryStatus: 'sending',
 };

 queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => [...(old || []), pendingMessage]);

 socket.emit('sendMessage', {
 conversationId,
 receiverId,
 content,
 replyToMessageId: replyToMessageId || undefined
 }, (response: any) => {
   if (response?.error) {
     queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
       if (!old) return old;
       return old.map((message) => message.id === clientId ? { ...message, deliveryStatus: 'failed' } : message);
     });
   }
 });
 }
 }, [conversationId, queryClient, socket]);

 const editMessage = useCallback((messageId: string, receiverId: string, content: string) => {
   if (socket && conversationId) {
     socket.emit('editMessage', { messageId, receiverId, content });
   }
 }, [conversationId, socket]);

 const deleteMessage = useCallback((messageId: string, receiverId: string, scope: 'me' | 'everyone') => {
   if (socket && conversationId) {
     socket.emit('deleteMessage', { messageId, receiverId, scope });
   }
 }, [conversationId, socket]);

 const togglePin = useCallback((messageId: string, receiverId: string) => {
   if (socket && conversationId) {
     socket.emit('togglePin', { messageId, receiverId });
   }
 }, [conversationId, socket]);

 const toggleStar = useCallback((messageId: string, receiverId: string) => {
   if (socket && conversationId) {
     socket.emit('toggleStar', { messageId, receiverId });
   }
 }, [conversationId, socket]);

 const sendTypingStatus = useCallback((receiverId: string, isTyping: boolean) => {
   if (socket && conversationId) {
     socket.emit('typing', { conversationId, receiverId, isTyping });
   }
 }, [conversationId, socket]);

 const sendRecordingStatus = useCallback((receiverId: string, isRecording: boolean) => {
   if (socket && conversationId) {
     socket.emit('recording', { conversationId, receiverId, isRecording });
   }
 }, [conversationId, socket]);

 const markMessagesRead = useCallback(() => {
   if (socket && conversationId) {
     socket.emit('markMessagesRead', { conversationId });
   }
 }, [conversationId, socket]);

 const toggleReaction = useCallback((messageId: string, receiverId: string, emoji: string) => {
   if (socket && conversationId) {
     socket.emit('toggleReaction', {
       messageId,
       conversationId,
       receiverId,
       emoji
     });
   }
 }, [conversationId, socket]);

 return {
 socket,
 messages,
 isLoading,
 sendMessage,
 editMessage,
 deleteMessage,
 togglePin,
 toggleStar,
 toggleReaction,
 sendTypingStatus,
 sendRecordingStatus,
 markMessagesRead,
 isTyping: conversationId ? !!typingUsers[conversationId] : false,
 isRecording: conversationId ? !!recordingUsers[conversationId] : false
 };
}
