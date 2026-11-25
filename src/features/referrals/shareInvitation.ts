const PUBLIC_SITE = 'https://connectlove.in';

/** Shared invitations must be reachable on the recipient's device, including
 * when the sender is testing the app on localhost or a private network. */
export function referralShareLink(sharePath: string, configuredSite = process.env.NEXT_PUBLIC_REFERRAL_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || ''): string {
  let origin = PUBLIC_SITE;
  try {
    const site = new URL(configuredSite);
    const host = site.hostname.toLowerCase();
    const privateHost = host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')
      || host === '[::1]' || host === '0.0.0.0' || /^127\./.test(host) || /^10\./.test(host)
      || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    if (site.protocol === 'https:' && !privateHost && !site.username && !site.password) origin = site.origin;
  } catch { /* Use the public production site when local configuration is absent. */ }
  const path = new URL(sharePath, PUBLIC_SITE);
  return new URL(`/register${path.search}`, origin).href;
}

export function referralInvitationText(link: string): string {
  return `Women inviting women: register using my link and verify your email to get ₹100 each. Rewards unlock after 30 days; minimum withdrawal ₹1,000. Use the app on 30 different days for an extra ₹100 activity bonus.\n\n${link}`;
}
