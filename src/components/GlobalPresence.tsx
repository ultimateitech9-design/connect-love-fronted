"use client";
import { SOCKET_ORIGIN } from "@/config/runtime";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { clearCachedPresence } from "@/features/user/matchFriends";

const SOCKET_URL = SOCKET_ORIGIN;

type IncomingMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

function messagePreview(content: string) {
  if (content.startsWith("__voice_message__:")) return "Voice message";
  if (content.startsWith("__photo_message__:")) return "Photo";
  if (content.startsWith("__video_message__:")) return "Video";
  if (content.startsWith("__gif_message__:")) return "GIF";
  if (content.startsWith("__call_log__:")) return "Call";
  if (content.startsWith("__chat_theme__:")) return "Chat theme changed";
  return content;
}

export function GlobalPresence() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    let stopOnlineUpdates = () => {};
    const start = () => {
    const token = getToken();
    if (!token) return;

    let userId = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = String(payload.sub || payload.userId);
    } catch (e) {
      console.error("Failed to parse token for GlobalPresence", e);
    }

    socket = io(SOCKET_URL, {
      auth: { token },
      query: { userId, token },
    });
    const liveSocket = socket;
    const onlineKey = ['online-friends', userId];
    let sequence = 0;
    const clearOnline = () => {
      sequence++;
      queryClient.setQueryData(onlineKey, []);
    };
    const refreshOnline = () => {
      if (!liveSocket.connected || getToken() !== token || !navigator.onLine) { clearOnline(); return; }
      const requested = ++sequence;
      liveSocket.timeout(5000).emit('onlineFriendsSnapshot', (error: Error | null, snapshot: { userIds?: string[] } | undefined) => {
        if (requested !== sequence || !liveSocket.connected || getToken() !== token) return;
        queryClient.setQueryData(onlineKey, !error && Array.isArray(snapshot?.userIds) ? snapshot.userIds.filter(id => typeof id === 'string') : []);
      });
    };
    const authChanged = () => {
      if (getToken() !== token) { clearOnline(); liveSocket.disconnect(); }
    };
    clearOnline();
    liveSocket.on('presenceReady', refreshOnline);
    const timer = window.setInterval(refreshOnline, 10000);
    window.addEventListener('focus', refreshOnline);
    window.addEventListener('online', refreshOnline);
    window.addEventListener('offline', clearOnline);
    window.addEventListener('connect-love-auth-change', authChanged);
    stopOnlineUpdates = () => {
      window.clearInterval(timer); clearOnline();
      window.removeEventListener('focus', refreshOnline);
      window.removeEventListener('online', refreshOnline);
      window.removeEventListener('offline', clearOnline);
      window.removeEventListener('connect-love-auth-change', authChanged);
    };

    socket.on("connect", () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ['profile-visitors'] });
      refreshOnline();
    });
    socket.on('profileVisitorsChanged', () => {
      void queryClient.invalidateQueries({ queryKey: ['profile-visitors'] });
    });
    socket.on("disconnect", () => {
      clearOnline();
      queryClient.setQueriesData({ queryKey: ["matches"] }, (matches: any) => Array.isArray(matches) ? clearCachedPresence(matches) : matches);
    });

    socket.on("receiveMessage", (message: IncomingMessage) => {
      if (String(message.senderId) === userId) return;

      queryClient.setQueriesData({ queryKey: ["matches"] }, (oldMatches: any) => {
        if (!Array.isArray(oldMatches)) return oldMatches;
        const updated = oldMatches.map((match: any) => {
          if (String(match.id) !== String(message.conversationId)) return match;

          return {
            ...match,
            lastMessage: messagePreview(message.content),
            lastMessageTime: message.createdAt,
            unreadCount: Number(match.unreadCount || 0) + 1,
          };
        });
        return updated.sort((a: any, b: any) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      });


    });

    socket.on("USER_STATUS_CHANGED", (payload: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      // Immediately remove offline users, then reconcile the full live set.
      if (!payload.isOnline) queryClient.setQueryData<string[]>(onlineKey, ids => (ids || []).filter(id => id !== payload.userId));
      refreshOnline();
      queryClient.setQueriesData({ queryKey: ["matches"] }, (oldMatches: any) => {
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
    };

    start();

    return () => {
      stopOnlineUpdates();
      socket?.disconnect();
    };
  }, [queryClient]);

  return null;
}
