"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function GlobalPresence() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let userId = "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = String(payload.sub || payload.userId);
    } catch (e) {
      console.error("Failed to parse token for GlobalPresence", e);
    }

    const socket = io(SOCKET_URL, {
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

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return null;
}
