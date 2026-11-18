import { Crown, Gem, Sparkles } from 'lucide-react';
import styles from './MembershipBadge.module.css';

export function MembershipBadge({ plan }: { plan: 'Gold' | 'Diamond' }) {
  const diamond = plan === 'Diamond';
  const Icon = diamond ? Gem : Crown;
  return (
    <span className={styles.badge + ' ' + (diamond ? styles.diamond : styles.gold)}>
      <span aria-hidden="true" className={styles.emblem}><Icon size={15} strokeWidth={1.8} /></span>
      <span className={styles.label}>{plan} Member</span>
      <Sparkles aria-hidden="true" size={13} className={styles.sparkle} />
    </span>
  );
}
