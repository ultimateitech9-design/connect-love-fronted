type SubscriptionUser = {
  plan?: string | null;
  planExpiresAt?: string | Date | null;
};

export function hasActivePaidPlan(user?: SubscriptionUser | null): boolean {
  if (!user) return false;
  const plan = String(user.plan || "free").toLowerCase();
  if (!['gold', 'platinum', 'diamond'].includes(plan)) return false;
  if (!user.planExpiresAt) return true;
  const expiresAt = new Date(user.planExpiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
