import { buildWeeklyForecast, fetchAthloneForecast } from "@/lib/metEireann";

export async function GET() {
  try {
    const entries = await fetchAthloneForecast();
    return Response.json({ days: buildWeeklyForecast(entries) });
  } catch (error) {
    return Response.json(
      { error: "Weather unavailable", detail: String(error) },
      { status: 502 }
    );
  }
}
