'use client';
import { io } from 'socket.io-client';
import { API_ORIGIN } from '@/config/runtime';
import { getManagementToken, getToken } from '@/lib/auth';

export function subscribeBillingUpdates(onChange: () => void, management = false) {
  const token = management ? getManagementToken() : getToken();
  if (!token) return () => {};
  const socket = io(API_ORIGIN.replace(/\/$/, '') + '/billing', {
    auth: { token }, transports: ['websocket', 'polling'],
  });
  socket.on('billingChanged', onChange);
  socket.on('connect', onChange);
  return () => { socket.disconnect(); };
}
