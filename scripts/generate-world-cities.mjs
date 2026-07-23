import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

function option(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || !process.argv[index + 1]) {
    throw new Error(`Missing required option ${name}`);
  }
  return resolve(process.argv[index + 1]);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const citiesFile = option("--cities");
const countryInfoFile = option("--countries");
const admin1File = option("--admin1");
const outputFile = option("--output");

const [citiesText, countriesText, admin1Text] = await Promise.all([
  readFile(citiesFile, "utf8"),
  readFile(countryInfoFile, "utf8"),
  readFile(admin1File, "utf8"),
]);

const countries = new Map();
for (const line of countriesText.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const fields = line.split("\t");
  const code = fields[0];
  const name = fields[4];
  const continent = fields[8];
  if (code && name) countries.set(code, { name, continent });
}

const admin1Names = new Map();
for (const line of admin1Text.split(/\r?\n/)) {
  if (!line) continue;
  const [code, name, asciiName] = line.split("\t");
  if (code) admin1Names.set(code, asciiName || name || "");
}

const parsed = [];
for (const line of citiesText.split(/\r?\n/)) {
  if (!line) continue;
  const fields = line.split("\t");
  const countryCode = fields[8];
  if (countryCode === "IN") continue;

  const country = countries.get(countryCode);
  if (!country) continue;

  const population = Number(fields[14] || 0);
  if (!Number.isFinite(population) || population <= 0) continue;

  const id = Number(fields[0]);
  const name = fields[2] || fields[1];
  const adminCode = fields[10];
  const adminName = admin1Names.get(`${countryCode}.${adminCode}`) || "";
  parsed.push({
    id,
    name,
    countryCode,
    countryName: country.name,
    continent: country.continent,
    adminName,
    population,
    latitude: Number(Number(fields[4]).toFixed(4)),
    longitude: Number(Number(fields[5]).toFixed(4)),
  });
}

parsed.sort((a, b) => b.population - a.population || a.id - b.id);
const selected = parsed.slice(0, 5000);
const usedPaths = new Set();

const cities = selected.map((city, rank) => {
  const countrySlug = slugify(city.countryName);
  const baseSlug = slugify(city.name) || `city-${city.id}`;
  let slug = baseSlug;
  const basePath = `${countrySlug}/${slug}`;

  if (usedPaths.has(basePath)) {
    const adminSlug = slugify(city.adminName);
    slug = adminSlug ? `${baseSlug}-${adminSlug}` : `${baseSlug}-${city.id}`;
  }
  if (usedPaths.has(`${countrySlug}/${slug}`)) {
    slug = `${baseSlug}-${city.id}`;
  }
  usedPaths.add(`${countrySlug}/${slug}`);

  return {
    ...city,
    rank: rank + 1,
    slug,
    countrySlug,
    adminSlug: slugify(city.adminName),
  };
});

const generated = {
  source: "GeoNames cities15000",
  sourceUrl: "https://download.geonames.org/export/dump/",
  license: "Creative Commons Attribution 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  generatedAt: new Date().toISOString(),
  selection:
    "Top 5,000 populated places outside India by GeoNames population, excluding records without a positive population.",
  cities,
};

await writeFile(outputFile, `${JSON.stringify(generated)}\n`, "utf8");
console.log(
  `Generated ${cities.length} cities across ${new Set(cities.map((city) => city.countryCode)).size} countries.`,
);
