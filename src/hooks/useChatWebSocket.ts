"use client";
import { SOCKET_ORIGIN, apiFetch } from "@/config/runtime";

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SOCKET_URL = SOCKET_ORIGIN;
const VOICE_MESSAGE_PREFIX = "__voice_message__:";
const PHOTO_MESSAGE_PREFIX = "__photo_message__:";
const VIDEO_MESSAGE_PREFIX = "__video_message__:";
const CHAT_THEME_MESSAGE_PREFIX = "__chat_theme__:";
const GIF_MESSAGE_PREFIX = "__gif_message__:";
const CALL_LOG_PREFIX = "__call_log__:";
const MESSAGE_PAGE_SIZE = 50;
const MESSAGE_CACHE_LIMIT = 50;

const messageCacheKey = (userId: string, conversationId: string) => `connect-love-messages:${userId}:${conversationId}`;

function readCachedMessages(userId: string, conversationId: string | null): Message[] {
 if (typeof window === 'undefined' || !userId || !conversationId) return [];
 try {
  const cached = JSON.parse(window.localStorage.getItem(messageCacheKey(userId, conversationId)) || '[]');
  return Array.isArray(cached) ? cached : [];
 } catch { return []; }
}

function saveCachedMessages(userId: string, conversationId: string, messages: Message[]) {
 try {
  const cacheable = messages.filter((message) => message.content.length < 50_000).slice(-MESSAGE_CACHE_LIMIT);
  window.localStorage.setItem(messageCacheKey(userId, conversationId), JSON.stringify(cacheable));
 } catch { /* Storage quota or privacy mode: network loading remains available. */ }
}

function messagePreview(content: string) {
 if (content.startsWith(CHAT_THEME_MESSAGE_PREFIX)) return "Chat theme changed";
 if (content.startsWith(VOICE_MESSAGE_PREFIX)) return "Voice message";
 if (content.startsWith(PHOTO_MESSAGE_PREFIX)) return "Photo";
 if (content.startsWith(VIDEO_MESSAGE_PREFIX)) return "Video";
 if (content.startsWith(GIF_MESSAGE_PREFIX)) return "GIF";
 if (content.startsWith(CALL_LOG_PREFIX)) {
  try {
   const call = JSON.parse(content.slice(CALL_LOG_PREFIX.length));
   return call.callType === "audio" ? "Audio call" : "Video call";
  } catch { return "Call"; }
 }
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

function userIdFromToken(token: string) {
 try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return String(payload.sub || payload.userId || '');
 } catch { return ''; }
}

export function useChatWebSocket(token: string, conversationId: string | null, onPlanLimitReached?: (message: string, content: string) => boolean | void) {
 const [socket, setSocket] = useState<Socket | null>(null);
 const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
 const [recordingUsers, setRecordingUsers] = useState<Record<string, boolean>>({});
 const queryClient = useQueryClient();
 const activeConversationRef = useRef(conversationId);
 const currentUserIdRef = useRef(userIdFromToken(token));
 const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
 const recordingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
 const [hasOlderMessages, setHasOlderMessages] = useState(true);
 const [isLoadingOlder, setIsLoadingOlder] = useState(false);

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
 queryClient.invalidateQueries({ queryKey: ['matches', 'active'] });
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
 queryClient.setQueriesData({ queryKey: ['matches', 'active', 'access-v4', userId] }, (oldMatches: any) => {
 if (!oldMatches) return oldMatches;
 const updated = oldMatches.map((match: any) => {
 if (match.id === message.conversationId) {
 return {
 ...match,
 lastMessage: messagePreview(message.content),
 lastMessageTime: message.createdAt,
 // Only increment unread if we are not the sender and not actively viewing this conversation
 unreadCount: (String(message.senderId) === userId || activeConversationRef.current === message.conversationId) 
 ? (activeConversationRef.current === message.conversationId ? 0 : match.unreadCount)
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
 apiFetch(`/messages/${message.conversationId}/read`, {
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
   queryClient.setQueriesData({ queryKey: ['matches', 'active', 'access-v4', userId] }, (oldMatches: any) => {
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

 // Show the last cached messages immediately, then refresh the latest batch silently.
 const { data: messages = [], isLoading } = useQuery<Message[]>({
 queryKey: ['messages', conversationId],
 queryFn: async () => {
  if (!conversationId || !token) return [];
  const res = await apiFetch(`/messages/${conversationId}?limit=${MESSAGE_PAGE_SIZE}`, {
   headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  const latest = await res.json() as Message[];
  setHasOlderMessages(latest.length === MESSAGE_PAGE_SIZE);
  return latest;
 },
 enabled: !!conversationId && !!token,
 initialData: () => readCachedMessages(currentUserIdRef.current, conversationId),
 initialDataUpdatedAt: 0,
 staleTime: 15_000,
 refetchOnMount: 'always',
 refetchOnWindowFocus: false,
 });

 useEffect(() => {
  if (!conversationId || !currentUserIdRef.current || messages.length === 0) return;
  saveCachedMessages(currentUserIdRef.current, conversationId, messages);
 }, [conversationId, messages]);

 useEffect(() => {
  setHasOlderMessages(true);
  setIsLoadingOlder(false);
 }, [conversationId]);

 const loadOlderMessages = useCallback(async () => {
  if (!conversationId || !token || isLoadingOlder || !hasOlderMessages || messages.length === 0) return;
  setIsLoadingOlder(true);
  try {
   const before = messages[0].createdAt;
   const res = await apiFetch(`/messages/${conversationId}?limit=${MESSAGE_PAGE_SIZE}&before=${encodeURIComponent(before)}`, {
    headers: { Authorization: `Bearer ${token}` }
   });
   if (!res.ok) throw new Error('Failed to fetch older messages');
   const older = await res.json() as Message[];
   setHasOlderMessages(older.length === MESSAGE_PAGE_SIZE);
   queryClient.setQueryData<Message[]>(['messages', conversationId], (current = []) => {
    const byId = new Map([...older, ...current].map((message) => [message.id, message]));
    return Array.from(byId.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
   });
  } catch {
   toast.error('Older messages could not be loaded.');
  } finally { setIsLoadingOlder(false); }
 }, [conversationId, hasOlderMessages, isLoadingOlder, messages, queryClient, token]);

 const sendMessage = useCallback((receiverId: string, content: string, replyToMessageId?: string | null) => {
 if (conversationId) {
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

 if (socket?.connected) {
  socket.emit('sendMessage', {
 conversationId,
 receiverId,
 content,
 replyToMessageId: replyToMessageId || undefined
 }, (response: any) => {
   if (response?.error) {
     const handled = onPlanLimitReached?.(response.error, content);
     if (!handled) toast.error(response.error);
     queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
       if (!old) return old;
       return old.map((message) => message.id === clientId ? { ...message, deliveryStatus: 'failed' } : message);
     });
   }
  });
  return;
 }

 // Keep sending responsive while the websocket is still connecting or briefly
 // reconnecting. The REST endpoint persists the same message immediately.
 apiFetch(`/messages/${conversationId}`, {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ receiverId, content, replyToMessageId: replyToMessageId || undefined }),
 })
  .then(async (response) => {
   if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const detail = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new Error(detail || 'Message send failed');
   }
   const saved = await response.json() as Message;
   queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) =>
    (old || []).map((message) => message.id === clientId ? { ...saved, deliveryStatus: 'sent' } : message),
   );
   queryClient.invalidateQueries({ queryKey: ['matches', 'active'] });
  })
  .catch((error) => {
   const message = error instanceof Error ? error.message : 'Message could not be sent.';
   const handled = onPlanLimitReached?.(message, content);
   if (!handled) toast.error(message);
   queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) =>
    (old || []).map((message) => message.id === clientId ? { ...message, deliveryStatus: 'failed' } : message),
   );
  });
 }
 }, [conversationId, onPlanLimitReached, queryClient, socket, token]);

 const editMessage = useCallback((messageId: string, receiverId: string, content: string) => {
   if (!conversationId) return;
   const applyUpdatedMessage = (message: Message) => {
     queryClient.setQueryData(['messages', message.conversationId], (old: Message[] | undefined) => {
       if (!old) return old;
       return old.map((current) => current.id === message.id ? { ...current, ...message } : current);
     });
   };

   const saveViaRest = () => apiFetch(`/messages/${messageId}`, {
     method: 'PATCH',
     headers: {
       'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
     },
     body: JSON.stringify({ content }),
   })
     .then(async (response) => {
       if (!response.ok) throw new Error('Message edit failed');
       applyUpdatedMessage(await response.json() as Message);
     })
     .catch(() => {});

    if (socket?.connected) {
      socket.timeout(4000).emit('editMessage', { messageId, receiverId, content }, (error: Error | null, response: any) => {
        if (error || response?.error) saveViaRest();
        else if (response?.data) applyUpdatedMessage(response.data as Message);
      });
     return;
   }

   saveViaRest();
 }, [conversationId, queryClient, socket, token]);

 const deleteMessage = useCallback((messageId: string, receiverId: string, scope: 'me' | 'everyone' = 'me') => {
   if (!conversationId) return;
   const applyDeletedMessage = (payload: { message: Message; scope: 'me' | 'everyone'; userId: string }) => {
     queryClient.setQueryData(['messages', payload.message.conversationId], (old: Message[] | undefined) => {
       if (!old) return old;
       if (payload.scope === 'me' && String(payload.userId) === currentUserIdRef.current) {
         return old.filter((message) => message.id !== payload.message.id);
       }
       return old.map((current) => current.id === payload.message.id ? { ...current, ...payload.message } : current);
     });
   };

   const deleteViaRest = () => apiFetch(`/messages/${messageId}/delete`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
     },
     body: JSON.stringify({ scope }),
   })
     .then(async (response) => {
       if (!response.ok) throw new Error('Message delete failed');
       const message = await response.json() as Message;
       applyDeletedMessage({ message, scope, userId: currentUserIdRef.current });
     })
     .catch(() => {});

    if (socket?.connected) {
      socket.timeout(4000).emit('deleteMessage', { messageId, receiverId, scope }, (error: Error | null, response: any) => {
        if (error || response?.error) deleteViaRest();
        else if (response?.data) applyDeletedMessage(response.data as { message: Message; scope: 'me' | 'everyone'; userId: string });
      });
     return;
   }

   deleteViaRest();
 }, [conversationId, queryClient, socket, token]);

 const togglePin = useCallback((messageId: string, receiverId: string) => {
   if (!conversationId) return;
   const applyMessage = (message: Message) => {
     queryClient.setQueryData(['messages', message.conversationId], (old: Message[] | undefined) =>
       old?.map((current) => current.id === message.id ? { ...current, ...message } : current),
     );
   };
   const saveViaRest = () => apiFetch(`/messages/${messageId}/pin`, {
     method: 'PATCH',
     headers: { Authorization: `Bearer ${token}` },
   }).then(async (response) => {
     if (!response.ok) throw new Error('Message pin failed');
     applyMessage(await response.json() as Message);
   }).catch(() => {});

   if (socket?.connected) {
     socket.timeout(4000).emit('togglePin', { messageId, receiverId }, (error: Error | null, response: any) => {
       if (error || response?.error) saveViaRest();
       else if (response?.data) applyMessage(response.data as Message);
     });
   } else {
     saveViaRest();
   }
 }, [conversationId, queryClient, socket, token]);

 const toggleStar = useCallback((messageId: string, receiverId: string) => {
   if (!conversationId) return;
   const applyMessage = (message: Message) => {
     queryClient.setQueryData(['messages', message.conversationId], (old: Message[] | undefined) =>
       old?.map((current) => current.id === message.id ? { ...current, ...message } : current),
     );
   };
   const saveViaRest = () => apiFetch(`/messages/${messageId}/star`, {
     method: 'PATCH',
     headers: { Authorization: `Bearer ${token}` },
   }).then(async (response) => {
     if (!response.ok) throw new Error('Message star failed');
     applyMessage(await response.json() as Message);
   }).catch(() => {});

   if (socket?.connected) {
     socket.timeout(4000).emit('toggleStar', { messageId, receiverId }, (error: Error | null, response: any) => {
       if (error || response?.error) saveViaRest();
       else if (response?.data) applyMessage(response.data as Message);
     });
   } else {
     saveViaRest();
   }
 }, [conversationId, queryClient, socket, token]);

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
   if (conversationId) {
     queryClient.setQueriesData({ queryKey: ['matches', 'active', 'access-v4', currentUserIdRef.current] }, (oldMatches: any) => {
       if (!Array.isArray(oldMatches)) return oldMatches;
       return oldMatches.map((match: any) => String(match.id) === String(conversationId) ? { ...match, unreadCount: 0 } : match);
     });
   }
   if (socket && conversationId) {
     socket.emit('markMessagesRead', { conversationId });
   }
 }, [conversationId, queryClient, socket]);

 const toggleReaction = useCallback((messageId: string, receiverId: string, emoji: string) => {
   if (!conversationId) return;
   const applyReactions = (reactions: Record<string, string[]>) => {
     queryClient.setQueryData(['messages', conversationId], (old: Message[] | undefined) => {
       if (!old) return old;
       return old.map((message) => message.id === messageId ? { ...message, reactions: JSON.stringify(reactions) } : message);
     });
   };

   const reactViaRest = () => apiFetch(`/messages/${messageId}/reaction`, {
     method: 'PATCH',
     headers: {
       'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`,
     },
     body: JSON.stringify({ emoji }),
   })
     .then(async (response) => {
       if (!response.ok) throw new Error('Message reaction failed');
       applyReactions(await response.json() as Record<string, string[]>);
     })
     .catch(() => {});

   if (socket?.connected) {
     socket.timeout(4000).emit('toggleReaction', {
       messageId,
       conversationId,
       receiverId,
       emoji
      }, (error: Error | null, response: any) => {
        if (error || response?.error) reactViaRest();
        else if (response?.data?.reactions) applyReactions(response.data.reactions as Record<string, string[]>);
      });
     return;
   }

   reactViaRest();
 }, [conversationId, queryClient, socket, token]);

 return {
 socket,
 messages,
 isLoading,
 hasOlderMessages,
 isLoadingOlder,
 loadOlderMessages,
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
