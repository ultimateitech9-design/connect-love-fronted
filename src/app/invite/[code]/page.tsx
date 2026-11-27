import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizedInvitationCode } from '@/features/referrals/signupAttribution';
import { ReferralInvite } from '@/features/referrals/ReferralInvite';

export const metadata: Metadata = { title: 'Your Connect Love invitation', robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizedInvitationCode((await params).code);
  if (!code) notFound();
  return <ReferralInvite code={code} />;
}
