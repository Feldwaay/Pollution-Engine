import { detectSpike } from "@/lib/spikeDetector";
import { classifyStation } from "@/lib/classifier";
import { supabase } from "@/lib/db";

export async function GET() {
  // Simulated station snapshot
  const stationSnapshot = {
    aqi: 310,
    pm25: 200,
    no2: 40,
    windSpeed: 3,
    industrialDistance: 1,
    trafficIndex: 0.2,
    nearbyStationSpikeCount: 2,
    citizenReportCount: 3,
    farmInfluenceIndex: 0.1
  };

  // Simulated historical AQI (1-hour rolling window)
  const historicalAQI = [
    150, 160, 170, 155, 165, 158,
    162, 168, 172, 159, 161, 166
  ];

  // Detect spike
  const spikeResult = detectSpike({
    currentAQI: stationSnapshot.aqi,
    historicalAQI
  });

  // If no spike, return early
  if (!spikeResult.isSpike) {
    return Response.json({
      eventDetected: false,
      currentAQI: stationSnapshot.aqi,
      spike: spikeResult
    });
  }

  // Run classification engine
  const classification = classifyStation(stationSnapshot);

  // Store event in Supabase
  const { error } = await supabase.from("pollution_events").insert([
    {
      station_snapshot: stationSnapshot,
      spike_data: spikeResult,
      classification_data: classification
    }
  ]);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Return final API response
  return Response.json({
    eventDetected: true,
    currentAQI: stationSnapshot.aqi,
    spike: spikeResult,
    classification
  });
}