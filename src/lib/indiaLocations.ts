export type DatingLocationKind = "city" | "state";

export type DatingLocation = {
  kind: DatingLocationKind;
  name: string;
  slug: string;
  stateName?: string;
  stateSlug?: string;
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

export const INDIA_CITIES: DatingLocation[] = cityEntries.map(([name, stateName]) => ({
  kind: "city",
  name,
  slug: locationSlug(name),
  stateName,
  stateSlug: locationSlug(stateName),
}));

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

export function getRelatedDatingLocations(location: DatingLocation) {
  if (location.kind === "city") {
    const sameState = INDIA_CITIES.filter(
      (city) => city.stateName === location.stateName && city.slug !== location.slug,
    );
    const parentState = INDIA_STATES.find((state) => state.name === location.stateName);
    return [...(parentState ? [parentState] : []), ...sameState].slice(0, 8);
  }

  const stateCities = INDIA_CITIES.filter((city) => city.stateName === location.name);
  if (stateCities.length) return stateCities.slice(0, 8);
  return INDIA_STATES.filter((state) => state.slug !== location.slug).slice(0, 8);
}
