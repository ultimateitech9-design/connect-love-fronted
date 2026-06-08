"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotifType = "match" | "message" | "profile";

export interface Notification {
 id: string;
 type: NotifType;
 title: string;
 body: string;
 time: string;
 read: boolean;
}

interface NotificationContextValue {
 notifications: Notification[];
 unreadCount: number;
 addNotification: (n: Omit<Notification, "id" | "read">) => void;
 markAllRead: () => void;
 clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const SEED_NOTIFICATIONS: Notification[] = [];

export function NotificationProvider({ children }: { children: ReactNode }) {
 const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

 const unreadCount = notifications.filter((n) => !n.read).length;

 const addNotification = useCallback((n: Omit<Notification, "id" | "read">) => {
 const id = `n-${Date.now()}`;
 setNotifications((prev) => [{ ...n, id, read: false }, ...prev]);
 }, []);

 const markAllRead = useCallback(() => {
 setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
 }, []);

 const clearAll = useCallback(() => {
 setNotifications([]);
 }, []);

 return (
 <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
 {children}
 </NotificationContext.Provider>
 );
}

export function useNotifications() {
 const ctx = useContext(NotificationContext);
 if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
 return ctx;
}
