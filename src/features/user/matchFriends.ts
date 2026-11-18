export function matchFriends(matches: any[], viewerId: string) {
  const friends = new Map<string, { id: string; userId: string; name: string; photo: string; isOnline: boolean }>();
  for (const match of matches) {
    if (match.locked || match.status !== 'MATCHED') continue;
    const ownSender = match.senderId === viewerId;
    if (!ownSender && match.receiverId !== viewerId) continue;
    const profile = ownSender ? match.receiver : match.sender;
    const userId = ownSender ? match.receiverId : match.senderId;
    if (!profile?.name || ['Unknown', 'Someone'].includes(profile.name) || !userId || friends.has(userId)) continue;
    friends.set(userId, {
      id: match.id, userId, name: profile.name,
      photo: profile.photos?.[0] || profile.avatarUrl || '',
      isOnline: profile.isOnline === true && profile.showOnlineStatus !== false && (!profile.status || profile.status === 'active'),
    });
  }
  return [...friends.values()];
}

// Presence in the offline cache is a historical snapshot, not current status.
export function clearCachedPresence(matches: any[]) {
  return matches.map(match => ({
    ...match,
    sender: match.sender ? { ...match.sender, isOnline: false } : match.sender,
    receiver: match.receiver ? { ...match.receiver, isOnline: false } : match.receiver,
  }));
}

export function onlineMatchFriends<T extends { userId: string }>(friends: T[], liveUserIds: string[]) {
  const live = new Set(liveUserIds);
  return friends.filter(friend => live.has(friend.userId));
}
