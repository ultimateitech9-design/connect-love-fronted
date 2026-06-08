"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';

export interface PresencePayload {
 userId: string;
 isOnline: boolean;
 lastSeen?: string;
}

export function usePresence(socket: Socket | null) {
 const queryClient = useQueryClient();

 useEffect(() => {
 if (!socket) return;

 const handlePresenceChange = (payload: PresencePayload) => {
 // Update active matches cache with the new online status
 queryClient.setQueryData(['matches', 'active'], (oldMatches: any) => {
 if (!oldMatches) return oldMatches;
 
 return oldMatches.map((match: any) => {
 if (match.sender?.id === payload.userId) {
 return {
 ...match,
 sender: {
 ...match.sender,
 isOnline: payload.isOnline,
 lastSeen: payload.lastSeen,
 }
 };
 } else if (match.receiver?.id === payload.userId) {
 return {
 ...match,
 receiver: {
 ...match.receiver,
 isOnline: payload.isOnline,
 lastSeen: payload.lastSeen,
 }
 };
 }
 return match;
 });
 });
 };

 socket.on('USER_STATUS_CHANGED', handlePresenceChange);

 return () => {
 socket.off('USER_STATUS_CHANGED', handlePresenceChange);
 };
 }, [socket, queryClient]);
}
