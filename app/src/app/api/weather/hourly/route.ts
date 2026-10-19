import { buildHourlyForecast, fetchAthloneForecast } from "@/lib/metEireann";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return Response.json({ error: "Missing ?date=YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const entries = await fetchAthloneForecast();
    return Response.json({ hours: buildHourlyForecast(entries, date) });
  } catch (error) {
    return Response.json(
      { error: "Weather unavailable", detail: String(error) },
      { status: 502 }
    );
  }
}
