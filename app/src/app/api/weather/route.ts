import { fetchAthloneForecast } from "@/lib/metEireann";

export async function GET() {
  try {
    const entries = await fetchAthloneForecast();
    return Response.json({ entries: entries.slice(0, 24) });
  } catch (error) {
    return Response.json(
      { error: "Weather unavailable", detail: String(error) },
      { status: 502 }
    );
  }
}
