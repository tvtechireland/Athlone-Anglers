// Met Éireann public "locationforecast" API — free, no key required.
// Docs: https://data.gov.ie/dataset/met-eireann-forecast-api
// Response is XML in the met.no/WDB2TS locationforecast schema.

const FORECAST_URL = "http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast";

// Athlone, Co. Westmeath
export const ATHLONE_COORDS = { lat: 53.4239, long: -7.9407 };

export type ForecastEntry = {
  from: string;
  to: string;
  temperatureC: number | null;
  windSpeedMps: number | null;
  windDirectionDeg: number | null;
  precipitationMm: number | null;
  symbol: string | null;
};

function attr(tag: string, name: string): number | null {
  const match = tag.match(new RegExp(`${name}="(-?[\\d.]+)"`));
  return match ? Number(match[1]) : null;
}

function attrStr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

// Minimal regex-based parse of the fixed locationforecast schema — avoids
// pulling in a full XML parser for a handful of fields.
//
// The feed emits two kinds of <time> block per hour, keyed by the same
// "from": an instant block (temperature/wind, from === to) and a 1-hour
// interval block (precipitation/symbol, to === from + 1h). Merge them by
// "from" into one record per hour.
export function parseForecastXml(xml: string): ForecastEntry[] {
  const timeBlocks = xml.match(/<time [^>]*>[\s\S]*?<\/time>/g) ?? [];
  const byFrom = new Map<string, ForecastEntry>();

  for (const block of timeBlocks) {
    const from = attrStr(block, "from");
    const to = attrStr(block, "to");
    if (!from || !to) continue;

    const existing = byFrom.get(from) ?? {
      from,
      to,
      temperatureC: null,
      windSpeedMps: null,
      windDirectionDeg: null,
      precipitationMm: null,
      symbol: null,
    };

    const temperature = block.match(/<temperature[^>]*\/>/)?.[0];
    const wind = block.match(/<windSpeed[^>]*\/>/)?.[0];
    const windDir = block.match(/<windDirection[^>]*\/>/)?.[0];
    const precip = block.match(/<precipitation[^>]*\/>/)?.[0];
    const symbol = block.match(/<symbol[^>]*\/>/)?.[0];

    if (temperature) existing.temperatureC = attr(temperature, "value");
    if (wind) existing.windSpeedMps = attr(wind, "mps");
    if (windDir) existing.windDirectionDeg = attr(windDir, "deg");
    // Prefer the 1-hour interval's precipitation/symbol over longer ones.
    if (precip && (existing.precipitationMm === null || to !== from)) {
      existing.precipitationMm = attr(precip, "value");
    }
    if (symbol) existing.symbol = attrStr(symbol, "name") ?? attrStr(symbol, "number");

    byFrom.set(from, existing);
  }

  return Array.from(byFrom.values()).sort((a, b) => a.from.localeCompare(b.from));
}

export async function fetchAthloneForecast(): Promise<ForecastEntry[]> {
  const url = `${FORECAST_URL}?lat=${ATHLONE_COORDS.lat};long=${ATHLONE_COORDS.long}`;

  const res = await fetch(url, {
    headers: { Accept: "application/xml" },
    next: { revalidate: 1800 }, // Met Éireann updates a few times/hour
  });

  if (!res.ok) {
    throw new Error(`Met Éireann API returned ${res.status}`);
  }

  const xml = await res.text();
  return parseForecastXml(xml);
}
