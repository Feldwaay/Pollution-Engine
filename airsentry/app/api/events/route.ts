import { classifyStation } from "@/lib/classifier";

export async function GET() {
  const testStation = {
    aqi: 320,
    pm25: 210,
    no2: 40,
    windSpeed: 3,
    industrialDistance: 1,
    trafficIndex: 0.2,
    nearbyStationSpikeCount: 1,
    citizenReportCount: 5,
    farmInfluenceIndex: 0.1
  };

  const result = classifyStation(testStation);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}