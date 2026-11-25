"use client";

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToken } from '@/lib/auth';
import { directFetch } from '@/lib/api';
import { currentUserQueryKey, useCurrentUser } from '@/hooks/useCurrentUser';
import { isWomanMember, ReferralDialog } from './ReferralEntry';

/** Pending state belongs to the registered account, so auto-login failure,
 * reloads and another device do not lose the welcome invitation. */
export function ReferralWelcomePopup() {
  const [token, setToken] = useState('');
  const [dismissedFor, setDismissedFor] = useState('');
  const [readyFor, setReadyFor] = useState('');
  const queries = useQueryClient();
  useEffect(() => { setToken(getToken() || ''); }, []);
  const { data: user } = useCurrentUser(token);
  const eligible = Boolean(user?.referralWelcomePending && user.role === 'user' && isWomanMember(user.gender) && dismissedFor !== user.id);
  const userId = user?.id;
  const registeredAt = user?.createdAt;
  useEffect(() => {
    setReadyFor('');
    if (!eligible || !userId) return;
    const registrationTime = Date.parse(registeredAt || '');
    // Anchor to the saved registration timestamp so navigation and reloads
    // only wait the remaining time, rather than starting another 45 seconds.
    const showAt = (Number.isFinite(registrationTime) ? registrationTime : Date.now()) + 45000;
    const timer = window.setTimeout(() => setReadyFor(userId), Math.max(0, showAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [eligible, userId, registeredAt]);
  if (!eligible || readyFor !== userId) return null;
  const close = () => {
    setDismissedFor(user.id);
    void directFetch('/referrals/welcome/dismiss', { method: 'POST' }).then(() => {
      queries.setQueryData(currentUserQueryKey(token), (current: Record<string, unknown> | undefined) => current ? { ...current, referralWelcomePending: false } : current);
    }).catch(() => { /* The account keeps the reminder for a later session if saving fails. */ });
  };
  return <ReferralDialog welcome onClose={close} />;
}
