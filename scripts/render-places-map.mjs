// Regenerate from Natural Earth's public-domain 1:110m Admin 0 Countries GeoJSON:
// Include the 1:50m file for Singapore, which the smaller world dataset omits.
// node scripts/render-places-map.mjs ne_110m_admin_0_countries.geojson ne_50m_admin_0_countries.geojson
import { readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync(process.argv[2], "utf8"));
const singapore = JSON.parse(readFileSync(process.argv[3], "utf8")).features.find(
  feature => feature.properties.ADM0_A3 === "SGP"
);
if (!singapore) throw new Error("Singapore is missing from the detailed map.");

const colors = [
  "#e29869", "#8ab68c", "#eabe64", "#80b9c5", "#b1c276", "#d58473", "#78aaa8",
  "#9e9bc3", "#d8a3ac", "#a1bfa0", "#89b4c9", "#bd9caf", "#dfae78",
];

function point([longitude, latitude]) {
  const x = 480 + 2.58 * longitude * (1 - 0.38 * (latitude / 90) ** 2);
  const y = 16 + (84 - latitude) * 2.65;
  return x.toFixed(1) + "," + y.toFixed(1);
}

const countries = [];
const paths = [];
for (const { properties, geometry } of [...data.features.filter(f => f.properties.ADM0_A3 !== "SGP"), singapore]) {
  if (properties.ADM0_A3 === "ATA") continue;
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const d = polygons.flatMap(polygon =>
    polygon.map(ring => "M" + ring.map(point).join(" ") + "Z")
  ).join("");
  const code = properties.ADM0_A3;
  countries.push({ code, color: colors[properties.MAPCOLOR13 - 1] ?? colors[0] });
  paths.push('<path id="' + code + '" d="' + d + '"/>');
}

writeFileSync("public/home/places-countries.svg",
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 410"><defs>\n' + paths.join("\n") + '\n</defs></svg>\n');
writeFileSync("src/components/home/places-countries.json", JSON.stringify(countries) + "\n");
