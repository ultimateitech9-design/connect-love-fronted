import importedCityEntries from "@/data/india-cities.json";
import indiaCityGeoData from "@/data/india-city-geo.json";

export type DatingLocationKind = "city" | "state";

export type CityGeo = {
  geonameId: number;
  /** True when GeoNames only has the district/tehsil, so population covers the whole area. */
  area: boolean;
  district: string;
  population: number;
  latitude: number;
  longitude: number;
};

export type DatingLocation = {
  kind: DatingLocationKind;
  name: string;
  slug: string;
  stateName?: string;
  stateSlug?: string;
  geo?: CityGeo;
};

export type NearbyDatingLocation = DatingLocation & { distanceKm?: number };

export const INDIA_CITY_GEO_DATA = indiaCityGeoData as {
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  cities: Record<string, CityGeo>;
};

export function locationSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const stateNames = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

const cityEntries = [
  ["Visakhapatnam", "Andhra Pradesh"],
  ["Vijayawada", "Andhra Pradesh"],
  ["Papum Pare", "Arunachal Pradesh"],
  ["Guwahati", "Assam"],
  ["Patna", "Bihar"],
  ["Raipur", "Chhattisgarh"],
  ["Ponda", "Goa"],
  ["Ahmedabad", "Gujarat"],
  ["Surat", "Gujarat"],
  ["Vadodara", "Gujarat"],
  ["Faridabad", "Haryana"],
  ["Gurugram", "Haryana"],
  ["Shimla", "Himachal Pradesh"],
  ["Jamshedpur", "Jharkhand"],
  ["Dhanbad", "Jharkhand"],
  ["Ranchi", "Jharkhand"],
  ["Bangalore", "Karnataka"],
  ["Mysore", "Karnataka"],
  ["Thiruvananthapuram", "Kerala"],
  ["Kochi", "Kerala"],
  ["Indore", "Madhya Pradesh"],
  ["Bhopal", "Madhya Pradesh"],
  ["Gwalior", "Madhya Pradesh"],
  ["Mumbai", "Maharashtra"],
  ["Pune", "Maharashtra"],
  ["Nagpur", "Maharashtra"],
  ["Thane", "Maharashtra"],
  ["Navi Mumbai", "Maharashtra"],
  ["Shillong", "Meghalaya"],
  ["Aizawl", "Mizoram"],
  ["Kohima", "Nagaland"],
  ["Bhubaneswar", "Odisha"],
  ["Cuttack", "Odisha"],
  ["Rourkela", "Odisha"],
  ["Ludhiana", "Punjab"],
  ["Amritsar", "Punjab"],
  ["Jalandhar", "Punjab"],
  ["Patiala", "Punjab"],
  ["Jaipur", "Rajasthan"],
  ["Jodhpur", "Rajasthan"],
  ["Kota", "Rajasthan"],
  ["Bikaner", "Rajasthan"],
  ["Gangtok", "Sikkim"],
  ["Chennai", "Tamil Nadu"],
  ["Coimbatore", "Tamil Nadu"],
  ["Madurai", "Tamil Nadu"],
  ["Hyderabad", "Telangana"],
  ["Warangal", "Telangana"],
  ["Kanpur", "Uttar Pradesh"],
  ["Lucknow", "Uttar Pradesh"],
  ["Ghaziabad", "Uttar Pradesh"],
  ["Varanasi", "Uttar Pradesh"],
  ["Prayagraj", "Uttar Pradesh"],
  ["Gorakhpur", "Uttar Pradesh"],
  ["Noida", "Uttar Pradesh"],
  ["Dehradun", "Uttarakhand"],
  ["Haridwar", "Uttarakhand"],
  ["Kolkata", "West Bengal"],
  ["Asansol", "West Bengal"],
  ["Siliguri", "West Bengal"],
  ["Chandigarh", "Chandigarh"],
  ["New Delhi", "Delhi"],
] as const;

export const INDIA_STATES: DatingLocation[] = stateNames.map((name) => ({
  kind: "state",
  name,
  slug: locationSlug(name),
}));

const uniqueCityEntries = [
  ...new Map(
    [...cityEntries, ...importedCityEntries.map(({ city, state }) => [city, state] as const)].map(([name, stateName]) => [
      `${name.toLocaleLowerCase("en-IN")}\u001f${stateName.toLocaleLowerCase("en-IN")}`,
      [name, stateName] as const,
    ]),
  ).values(),
];

// Old names and spelling variants that GeoNames resolves to the same place as
// another entry. Each alias page permanently redirects to the canonical city
// so the same place is not published twice. Keys and values are "City|State".
const CITY_ALIASES: Record<string, string> = {
  "Gurgaon|Haryana": "Gurugram|Haryana",
  "Bangalore|Karnataka": "Bengaluru|Karnataka",
  "Mysore|Karnataka": "Mysuru|Karnataka",
  "Bellary|Karnataka": "Ballari|Karnataka",
  "Tumkur|Karnataka": "Tumakuru|Karnataka",
  "Shimoga|Karnataka": "Shivamogga|Karnataka",
  "Chikmagalur|Karnataka": "Chikkamagaluru|Karnataka",
  "Allahabad|Uttar Pradesh": "Prayagraj|Uttar Pradesh",
  "Koil|Uttar Pradesh": "Aligarh|Uttar Pradesh",
  "Shihor|Gujarat": "Sihor|Gujarat",
  "Dombivli|Maharashtra": "Kalyan-Dombivli|Maharashtra",
  "Bhayandar|Maharashtra": "Mira-Bhayandar|Maharashtra",
  "Ahmednagar|Maharashtra": "Ahilyanagar|Maharashtra",
  "Osmanabad|Maharashtra": "Dharashiv|Maharashtra",
  "Kancheepuram|Tamil Nadu": "Kanchipuram|Tamil Nadu",
  "Thiruvallur|Tamil Nadu": "Tiruvallur|Tamil Nadu",
  "Viluppuram|Tamil Nadu": "Villupuram|Tamil Nadu",
  "Thoothukkudi|Tamil Nadu": "Thoothukudi|Tamil Nadu",
  "S.A.S Nagar|Punjab": "Mohali|Punjab",
  "Ferozepur|Punjab": "Firozpur|Punjab",
  "Bokaro Steel City|Jharkhand": "Bokaro|Jharkhand",
  "Daltonganj|Jharkhand": "Medininagar|Jharkhand",
  "Zünheboto|Nagaland": "Zunheboto|Nagaland",
  "Dhaulpur|Rajasthan": "Dholpur|Rajasthan",
  "Jaintia Hills|Meghalaya": "West Jaintia Hills|Meghalaya",
  "Ribhoi|Meghalaya": "Ri Bhoi|Meghalaya",
  "Sipahijala|Tripura": "Sepahijala|Tripura",
  "Nicobars|Andaman and Nicobar Islands": "Nicobar Islands|Andaman and Nicobar Islands",
  "Lakshadweep District|Lakshadweep": "Lakshadweep|Lakshadweep",
  "Baleshwar|Odisha": "Balasore|Odisha",
  "Anugul|Odisha": "Angul|Odisha",
};

const citySlugCounts = new Map<string, number>();
for (const [name] of uniqueCityEntries) {
  const slug = locationSlug(name);
  citySlugCounts.set(slug, (citySlugCounts.get(slug) ?? 0) + 1);
}

// Slugs are computed over the full list (aliases included) so removing an
// alias never changes the URL of another city.
const ALL_CITIES: DatingLocation[] = uniqueCityEntries.map(
  ([name, stateName]) => {
    const citySlug = locationSlug(name);
    const stateSlug = locationSlug(stateName);

    return {
      kind: "city",
      name,
      slug:
        (citySlugCounts.get(citySlug) ?? 0) > 1
          ? `${citySlug}-${stateSlug}`
          : citySlug,
      stateName,
      stateSlug,
      geo: INDIA_CITY_GEO_DATA.cities[`${name}|${stateName}`],
    };
  },
);

const cityKey = (city: DatingLocation) => `${city.name}|${city.stateName}`;

export const INDIA_CITIES = ALL_CITIES.filter((city) => !CITY_ALIASES[cityKey(city)]);

/** Alias slug -> canonical city, for permanent redirects. */
export const INDIA_CITY_REDIRECTS = new Map(
  ALL_CITIES.flatMap((city) => {
    const target = CITY_ALIASES[cityKey(city)];
    const canonical = target && INDIA_CITIES.find((candidate) => cityKey(candidate) === target);
    return canonical ? [[city.slug, canonical] as const] : [];
  }),
);

export const INDIA_DATING_LOCATIONS = [...INDIA_STATES, ...INDIA_CITIES];

export function datingLocationPath(location: DatingLocation) {
  return `/dating/${location.kind}/${location.slug}`;
}

export function getDatingLocation(kind: string, slug: string) {
  if (kind !== "city" && kind !== "state") return undefined;
  return INDIA_DATING_LOCATIONS.find(
    (location) => location.kind === kind && location.slug === slug,
  );
}

function distanceKm(a: CityGeo, b: CityGeo) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}

export type IndiaCityFacts = {
  stateRank?: number;
  stateTownCount: number;
  largestInState?: DatingLocation;
  distanceToLargestKm?: number;
  nearestLarger?: NearbyDatingLocation;
  districtNeighbours: DatingLocation[];
};

// Factual context from GeoNames. Rankings only count towns (not
// district-level records, whose population covers a whole area).
export function getIndiaCityFacts(location: DatingLocation): IndiaCityFacts {
  const geo = location.geo;
  const stateTowns = INDIA_CITIES.filter(
    (city) => city.stateName === location.stateName && city.geo && !city.geo.area && city.geo.population > 0,
  ).sort((a, b) => b.geo!.population - a.geo!.population);
  const largestInState = stateTowns[0];
  const facts: IndiaCityFacts = {
    stateTownCount: stateTowns.length,
    largestInState,
    districtNeighbours: geo?.district
      ? INDIA_CITIES.filter(
          (city) =>
            city.stateName === location.stateName &&
            city.geo?.district === geo.district &&
            !city.geo.area &&
            city.slug !== location.slug,
        ).slice(0, 6)
      : [],
  };
  if (!geo || geo.area) return facts;

  const rank = stateTowns.indexOf(location);
  if (rank >= 0) facts.stateRank = rank + 1;
  if (largestInState && largestInState !== location) {
    facts.distanceToLargestKm = distanceKm(geo, largestInState.geo!);
  }
  facts.nearestLarger = INDIA_CITIES.filter(
    (city) => city.geo && !city.geo.area && city.geo.population > geo.population,
  )
    .map((city) => ({ ...city, distanceKm: distanceKm(geo, city.geo!) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  return facts;
}

export function getRelatedDatingLocations(location: DatingLocation): NearbyDatingLocation[] {
  if (location.kind === "city" && location.geo) {
    // Real neighbours by distance: different for every city page.
    const geo = location.geo;
    const parentState = INDIA_STATES.find((state) => state.name === location.stateName);
    const nearest = INDIA_CITIES.filter((city) => city.geo && city.slug !== location.slug)
      .map((city) => ({ ...city, distanceKm: distanceKm(geo, city.geo!) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 7);
    return [...(parentState ? [parentState] : []), ...nearest];
  }

  if (location.kind === "city") {
    const stateCities = INDIA_CITIES.filter((city) => city.stateName === location.stateName);
    const parentState = INDIA_STATES.find((state) => state.name === location.stateName);
    // Take the cities either side of this one in the state list (wrapping
    // around) instead of the same first few for every page, so each city page
    // links to different siblings and every city is linked from some sibling.
    const index = stateCities.findIndex((city) => city.slug === location.slug);
    const siblingCount = Math.min(7, stateCities.length - 1);
    const siblings = Array.from({ length: siblingCount }, (_, offset) => {
      const step = offset % 2 === 0 ? offset / 2 + 1 : -(offset + 1) / 2;
      return stateCities[(index + step + stateCities.length) % stateCities.length];
    });
    return [...(parentState ? [parentState] : []), ...siblings];
  }

  // State pages are the hub for their cities, so link every one of them.
  const stateCities = INDIA_CITIES.filter((city) => city.stateName === location.name);
  if (stateCities.length) return stateCities;
  return INDIA_STATES.filter((state) => state.slug !== location.slug).slice(0, 8);
}
