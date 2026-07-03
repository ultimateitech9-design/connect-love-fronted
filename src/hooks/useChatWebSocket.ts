"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
const VOICE_MESSAGE_PREFIX = "__voice_message__:";
const PHOTO_MESSAGE_PREFIX = "__photo_message__:";
const VIDEO_MESSAGE_PREFIX = "__video_message__:";
const CHAT_THEME_MESSAGE_PREFIX = "__chat_theme__:";

function messagePreview(content: string) {
 if (content.startsWith(CHAT_THEME_MESSAGE_PREFIX)) return "Chat theme changed";
 if (content.startsWith(VOICE_MESSAGE_PREFIX)) return "Voice message";
 if (content.startsWith(PHOTO_MESSAGE_PREFIX)) return "Photo";
 if (content.startsWith(VIDEO_MESSAGE_PREFIX)) return "Video";
 return content;
}

export interface Message {
 id: string;
 conversationId: string;
 senderId: string;
 receiverId: string;
 content: string;
 isRead: boolean;
 createdAt: string;
}

export function useChatWebSocket(token: string, conversationId: string | null) {
 const [socket, setSocket] = useState<Socket | null>(null);
 const queryClient = useQueryClient();
 const activeConversationRef = useRef(conversationId);

 useEffect(() => {
 activeConversationRef.current = conversationId;
 }, [conversationId]);

 useEffect(() => {
 if (!token) return;

 let userId = '';
 try {
 const payload = JSON.parse(atob(token.split('.')[1]));
 userId = String(payload.sub || payload.userId);
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
 if (!old) return [message];
 // Prevent duplicates
 if (old.find(m => m.id === message.id)) return old;
 return [...old, message];
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
 fetch(`${API_URL}/messages/${message.conversationId}/read`, {
 method: 'PATCH',
 headers: { Authorization: `Bearer ${token}` }
 }).catch(() => {});
 }
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

 return () => {
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

 const sendMessage = (receiverId: string, content: string) => {
 if (socket && conversationId) {
 socket.emit('sendMessage', {
 conversationId,
 receiverId,
 content
 });
 }
 };

 return {
 socket,
 messages,
 isLoading,
 sendMessage
 };
}
