'use client';
import { io } from 'socket.io-client';
import { socketConnectionOptions } from '@/config/runtime';
import { getManagementToken, getToken } from '@/lib/auth';

export function subscribeBillingUpdates(onChange: () => void, management = false) {
  const token = management ? getManagementToken() : getToken();
  if (!token) return () => {};
  const connection = socketConnectionOptions();
  const socket = io(connection.origin + '/billing', {
    ...connection.options, auth: { token },
  });
  socket.on('billingChanged', onChange);
  socket.on('connect', onChange);
  return () => { socket.disconnect(); };
}
