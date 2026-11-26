import { ReferralPanel } from '@/features/referrals/ReferralPanel';

export default function ReferralsPage() {
  return <div className="mx-auto max-w-3xl pb-12"><h1 className="mb-1 text-2xl font-bold">Referral wallet</h1><p className="mb-6 text-sm text-muted-foreground">Share, earn and track your referral rewards.</p><ReferralPanel /></div>;
}
