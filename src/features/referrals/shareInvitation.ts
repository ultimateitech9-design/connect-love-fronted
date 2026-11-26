const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.connectlove';
const CODE = /^[a-f0-9]{24}$/;

/** Accept either a normal registration link or the Play Install Referrer payload
 * forwarded by the Android app when it opens registration after installation. */
export function registrationReferralCode(search: string): string {
  const params = new URLSearchParams(search);
  const direct = params.get('ref') || '';
  if (CODE.test(direct)) return direct;
  const referrer = new URLSearchParams(params.get('referrer') || '');
  const installed = referrer.get('ref') || '';
  return CODE.test(installed) ? installed : '';
}

/** Google Play retains the encoded invitation for the Android Install Referrer API. */
export function referralShareLink(sharePath: string): string {
  const code = registrationReferralCode(new URL(sharePath, 'https://connectlove.in').search);
  const link = new URL(PLAY_STORE_URL);
  if (code) link.searchParams.set('referrer', new URLSearchParams({ ref: code, utm_source: 'member_referral' }).toString());
  return link.href;
}

export function referralInvitationText(link: string, rewardPaise = 10000): string {
  const amount = rewardPaise === 5000 ? 50 : 100;
  const group = amount === 50 ? 'Men inviting men' : 'Women inviting women';
  return `${group}: download Connect Love from Google Play using my link, then register and verify your email to get ₹${amount} each. Rewards unlock after 30 days; minimum withdrawal ₹1,000. Use the app on 30 different days for an extra ₹${amount} activity bonus.\n\n${link}`;
}
