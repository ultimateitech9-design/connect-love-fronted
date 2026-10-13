// Builds src/data/india-city-geo.json: GeoNames population, district and
// coordinates for each Indian city in src/data/india-cities.json and the
// hardcoded list in src/lib/indiaLocations.ts.
//
// Usage (files from https://download.geonames.org/export/dump/):
//   node scripts/generate-india-city-geo.mjs --places IN.txt \
//     --admin1 admin1CodesASCII.txt --admin2 admin2Codes.txt \
//     --output src/data/india-city-geo.json
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

function option(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) {
    throw new Error(`Missing required option ${name}`);
  }
  return resolve(process.argv[index + 1]);
}

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const root = resolve(import.meta.dirname, "..");
const [placesText, admin1Text, admin2Text, locationsSource, importedCities] = await Promise.all([
  readFile(option("--places"), "utf8"),
  readFile(option("--admin1"), "utf8"),
  readFile(option("--admin2"), "utf8"),
  readFile(resolve(root, "src/lib/indiaLocations.ts"), "utf8"),
  readFile(resolve(root, "src/data/india-cities.json"), "utf8").then(JSON.parse),
]);
const outputFile = option("--output");

const listStart = locationsSource.indexOf("const cityEntries = [");
const listEnd = locationsSource.indexOf("] as const;", listStart);
const hardcoded = [...locationsSource.slice(listStart, listEnd).matchAll(/\["([^"]+)", "([^"]+)"\]/g)]
  .map(([, city, state]) => ({ city, state }));

const cities = new Map();
for (const entry of [...hardcoded, ...importedCities]) {
  cities.set(`${entry.city.toLowerCase()}|${entry.state.toLowerCase()}`, entry);
}

// GeoNames only has an unrelated same-name village for these localities
// (checked by hand: wrong district), so they get no geo data.
const knownMismatches = new Set(["Selaiyur|Tamil Nadu", "Manikonda|Telangana"]);

// GeoNames uses a shorter name for this union territory.
const stateAliases = { "Andaman and Nicobar Islands": "Andaman and Nicobar" };

const admin1 = new Map();
for (const line of admin1Text.split(/\r?\n/)) {
  const [code, , asciiName] = line.split("\t");
  if (code?.startsWith("IN.")) admin1.set(code.slice(3), asciiName);
}
const admin2 = new Map();
for (const line of admin2Text.split(/\r?\n/)) {
  const [code, , asciiName] = line.split("\t");
  if (code?.startsWith("IN.")) admin2.set(code, asciiName);
}

const byName = new Map();
for (const line of placesText.split(/\r?\n/)) {
  if (!line) continue;
  const fields = line.split("\t");
  const [featureClass, featureCode] = [fields[6], fields[7]];
  if (featureClass !== "P" && featureCode !== "ADM2" && featureCode !== "ADM3") continue;

  const place = {
    id: Number(fields[0]),
    primaryNames: new Set([normalize(fields[1]), normalize(fields[2])]),
    featureCode,
    state: admin1.get(fields[10]) ?? "",
    district: admin2.get(`IN.${fields[10]}.${fields[11]}`) ?? "",
    population: Number(fields[14] || 0),
    latitude: Number(Number(fields[4]).toFixed(4)),
    longitude: Number(Number(fields[5]).toFixed(4)),
  };
  const names = new Set([...place.primaryNames]);
  for (const alternate of fields[3].split(",")) {
    if (alternate && alternate.length < 60) names.add(normalize(alternate));
  }
  for (const name of names) {
    if (!name) continue;
    const list = byName.get(name);
    if (list) list.push(place);
    else byName.set(name, [place]);
  }
}

const featurePreference = { PPLC: 6, PPLA: 5, PPLA2: 4, PPLA3: 3, PPL: 2, PPLX: 1 };
function score(place) {
  return [
    place.population > 0 ? 1 : 0,
    // A place whose own name matches beats one that only lists it as an
    // alternate name (e.g. "East Godavari" the district, not Kakinada city),
    // but never at the cost of picking an unpopulated same-name village.
    place.exact ? 1 : 0,
    featurePreference[place.featureCode] ?? -1,
    place.population,
  ];
}
function better(a, b) {
  const [sa, sb] = [score(a), score(b)];
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i] ? a : b;
  }
  return a;
}

const output = {};
const ambiguous = [];
let matched = 0;
for (const { city, state } of cities.values()) {
  if (knownMismatches.has(`${city}|${state}`)) continue;
  const geoState = stateAliases[state] ?? state;
  const key = normalize(city);
  const candidates = (byName.get(key) ?? []).filter((place) => place.state === geoState);
  if (!candidates.length) continue;
  const best = candidates
    .map((place) => ({ ...place, exact: place.primaryNames.has(key) }))
    .reduce(better);
  // With no population to tell same-name villages apart, a choice between
  // several places is a guess; publishing wrong facts is worse than none.
  const sameNameTowns = candidates.filter((place) => place.featureCode.startsWith("PPL"));
  if (best.population === 0 && sameNameTowns.length > 1) {
    ambiguous.push(city);
    continue;
  }
  output[`${city}|${state}`] = {
    geonameId: best.id,
    // ADM2/ADM3 records are districts/tehsils: their population covers the
    // whole area, not a single town.
    area: best.featureCode.startsWith("ADM"),
    district: best.district.replace(/ District$/, ""),
    population: best.population,
    latitude: best.latitude,
    longitude: best.longitude,
  };
  matched += 1;
}

await writeFile(
  outputFile,
  `${JSON.stringify({
    source: "GeoNames",
    sourceUrl: "https://download.geonames.org/export/dump/",
    license: "Creative Commons Attribution 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    cities: output,
  })}\n`,
);
console.log(`Matched ${matched} of ${cities.size} cities -> ${outputFile}`);
console.log(`Skipped ${ambiguous.length} ambiguous names: ${ambiguous.join(", ")}`);
