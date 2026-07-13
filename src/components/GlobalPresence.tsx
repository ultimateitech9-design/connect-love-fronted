"use client";
import { SOCKET_ORIGIN } from "@/config/runtime";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";

const SOCKET_URL = SOCKET_ORIGIN;

export function GlobalPresence() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: ReturnType<typeof io> | null = null;
    let cancelled = false;
    const start = () => {
    if (cancelled) return;
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
      query: { userId, token },
    });

    socket.on("USER_STATUS_CHANGED", (payload: { userId: string; isOnline: boolean; lastSeen?: string }) => {
      queryClient.setQueryData(["matches", "active"], (oldMatches: any) => {
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

    const timer = window.setTimeout(start, 8000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      socket?.disconnect();
    };
  }, [queryClient]);

  return null;
}
