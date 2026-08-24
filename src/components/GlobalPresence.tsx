"use client";
import { SOCKET_ORIGIN } from "@/config/runtime";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";

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

    socket.on("connect", () => {
      queryClient.invalidateQueries({ queryKey: ["matches", "active"] });
    });

    socket.on("receiveMessage", (message: IncomingMessage) => {
      if (String(message.senderId) === userId) return;

      queryClient.setQueriesData({ queryKey: ["matches", "active", "access-v4", userId] }, (oldMatches: any) => {
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
      queryClient.setQueriesData({ queryKey: ["matches", "active", "access-v4", userId] }, (oldMatches: any) => {
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
      socket?.disconnect();
    };
  }, [queryClient]);

  return null;
}
