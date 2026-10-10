import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { datingLocationPath, INDIA_CITIES } from "@/lib/indiaLocations";

// Photos are cropped thumbnails from Wikimedia Commons; each `credit` is the
// attribution their CC BY-SA / Free Art licences require.
const topCities = [
  { name: "Delhi", state: "Delhi", landmark: "India Gate", credit: "AKS.9955, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:India_Gate_front.jpg" },
  { name: "Mumbai", state: "Maharashtra", landmark: "Gateway of India", credit: "A.Savin, Free Art License", source: "https://commons.wikimedia.org/wiki/File:Mumbai_03-2016_30_Gateway_of_India.jpg" },
  { name: "Kolkata", state: "West Bengal", landmark: "Victoria Memorial", credit: "Subhrajyoti07, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Victoria_Memorial_situated_in_Kolkata.jpg" },
  { name: "Patna", state: "Bihar", landmark: "Golghar", credit: "Himanshu Manne, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Golghar_%E0%A5%AA.jpg" },
  { name: "Lucknow", state: "Uttar Pradesh", landmark: "Rumi Darwaza", credit: "Rishabhgpt, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Rumi_Darwaza_-_DSC2797-01.jpg" },
  { name: "Ghaziabad", state: "Uttar Pradesh", landmark: "Indirapuram skyline", credit: "Mnstwr2418, CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Indirapuram.jpg" },
  { name: "Chandigarh", state: "Chandigarh", landmark: "Open Hand Monument", credit: "Raakesh Blokhra, CC BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:Open_Hand_monument,_Chandigarh.jpg" },
  { name: "Jaipur", state: "Rajasthan", landmark: "Hawa Mahal", credit: "Chainwit., CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg" },
  { name: "Surat", state: "Gujarat", landmark: "Surat skyline", credit: "Rahul Bhadane, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Bharthana_Althan_area.jpg" },
  { name: "Guwahati", state: "Assam", landmark: "Kamakhya Temple", credit: "Devkmaravi, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kamakhya_Temple_-_DEV_8829.jpg" },
  { name: "Bhubaneswar", state: "Odisha", landmark: "Lingaraja Temple", credit: "Satyakam Parthasarathy, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Lingaraj_Temple_,_Bhubaneswar.jpg" },
  { name: "Bengaluru", state: "Karnataka", landmark: "Vidhana Soudha", credit: "Yashaswi.jayakumar, CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Lighting_of_Vidhana_Soudha.jpg" },
  { name: "Hyderabad", state: "Telangana", landmark: "Charminar", credit: "DidierTais, CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Charminar_Hyderabad_1.jpg" },
  { name: "Jammu", state: "Jammu and Kashmir", landmark: "Mubarak Mandi Palace", credit: "Jehangir, CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Mubarak_Mandi_Complex.jpg" },
];

// Resolve each city against the location dataset so links always use the
// same slug as the generated /dating/city/... page.
const cities = topCities.flatMap((city) => {
  const location = INDIA_CITIES.find(
    (candidate) => candidate.name === city.name && candidate.stateName === city.state,
  );
  if (!location) return [];
  return [{
    ...city,
    href: datingLocationPath(location),
    image: `/images/cities/${city.name.toLowerCase()}.jpg`,
  }];
});

export function TopCitiesSection() {
  return (
    <section id="top-cities" className="marketing-deferred-section bg-white py-14 sm:py-16 dark:bg-[#090910]">
      <div className="mx-auto w-[90vw] max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-rose-500">
            <MapPin className="h-4 w-4" />
            Top cities
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Meet singles in{" "}
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              top Indian cities
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            Explore local dating pages and find people looking for friendship, love and
            meaningful relationships near you.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
          {cities.map((city) => (
            <li key={city.href}>
              <Link href={city.href} className="group flex flex-col items-center text-center">
                <span className="relative block h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-rose-200 transition group-hover:scale-105 group-hover:ring-rose-400 sm:h-32 sm:w-32 dark:border-[#1a1a24] dark:ring-rose-500/30">
                  <Image
                    src={city.image}
                    alt={`${city.landmark}, ${city.name}`}
                    title={`Photo: ${city.credit}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </span>
                <span className="mt-4 text-lg font-bold text-slate-950 group-hover:text-rose-600 dark:text-white dark:group-hover:text-rose-300">
                  {city.name}
                </span>
                <span className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Singles • Dating • Friendship
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            href="/dating/city"
            className="inline-flex min-h-12 items-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-3 font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.03]"
          >
            View all cities
          </Link>
        </div>

        <details className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <summary className="cursor-pointer">Photo credits</summary>
          <p className="mx-auto mt-2 max-w-4xl leading-6">
            {cities.map((city, index) => (
              <span key={city.href}>
                {index > 0 ? " · " : ""}
                <a href={city.source} target="_blank" rel="noreferrer" className="hover:text-rose-500 hover:underline">
                  {city.landmark}: {city.credit}
                </a>
              </span>
            ))}
            {" "}via Wikimedia Commons.
          </p>
        </details>
      </div>
    </section>
  );
}
