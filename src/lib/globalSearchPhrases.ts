const searchIntents = [
  "love connection",
  "local singles",
  "online dating",
  "dating app",
  "dating site",
  "genuine dating",
  "safe dating",
  "verified singles",
  "compatible matches",
  "serious relationship",
  "long term relationship",
  "meaningful relationship",
  "find love",
  "meet new people",
  "meet local singles",
  "matchmaking service",
  "life partner search",
  "relationship app",
  "nearby singles",
  "dating for adults",
  "authentic connections",
  "friendship and dating",
  "relationship matching",
  "private dating",
  "trusted dating platform",
] as const;

const searchQualifiers = [
  "near me",
  "in my city",
  "for serious relationships",
  "for long term dating",
  "with verified profiles",
  "for genuine connections",
  "for compatible singles",
  "with privacy controls",
  "with safety features",
  "for meaningful relationships",
  "for local people",
  "for relationship seekers",
  "for adults",
  "for new friendships",
  "for committed singles",
  "with smart matching",
  "with authentic profiles",
  "for meeting people nearby",
  "for finding a partner",
  "for respectful dating",
] as const;

export const GLOBAL_SEARCH_PHRASES = searchIntents.flatMap((intent) =>
  searchQualifiers.map((qualifier) => `${intent} ${qualifier}`),
);

function phraseSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getCitySearchPhrases(
  cityName: string,
  countryName: string,
  count = 8,
) {
  const seed = phraseSeed(`${cityName}:${countryName}`);
  const contextual = [
    `love connection in ${cityName}`,
    `lover near me in ${cityName}`,
    `singles near me in ${cityName}`,
    `online dating in ${cityName}`,
    `dating app in ${cityName}`,
    `meet local singles in ${cityName}`,
    `find love in ${cityName}`,
    `serious relationship dating in ${cityName}`,
  ];
  const selected = Array.from({ length: Math.max(0, count - contextual.length) }, (_, index) => {
    const phrase = GLOBAL_SEARCH_PHRASES[(seed + index * 37) % GLOBAL_SEARCH_PHRASES.length];
    return `${phrase} in ${countryName}`;
  });
  return [...contextual, ...selected].slice(0, count);
}

if (GLOBAL_SEARCH_PHRASES.length !== 500) {
  throw new Error("Global search phrase bank must contain exactly 500 phrases.");
}
