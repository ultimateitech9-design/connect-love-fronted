"use client";

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const directoryAvatarKey = (userId: string) => ['management-user-avatar', userId] as const;

export function UserDirectoryAvatar({ userId, name }: { userId: string; name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '80px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const { data } = useQuery({
    queryKey: directoryAvatarKey(userId),
    queryFn: ({ signal }) => apiFetch<{ photo: string | null }>(`/users/${encodeURIComponent(userId)}/avatar`, { signal }),
    enabled: visible, staleTime: 60000, gcTime: 5 * 60000, refetchOnWindowFocus: false, retry: false,
  });
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return <span ref={ref} className="shrink-0" data-user-avatar={userId}>
    <Avatar className="h-10 w-10 ring-1 ring-rose-100"><AvatarImage src={data?.photo || undefined} alt={`${name}'s profile photo`} className="object-cover" /><AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white">{initials}</AvatarFallback></Avatar>
  </span>;
}
