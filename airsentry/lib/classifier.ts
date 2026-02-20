export type ClassificationInput = {
    aqi: number;
    pm25: number;
    no2: number;
    windSpeed: number;
    industrialDistance: number;
    trafficIndex: number;
    nearbyStationSpikeCount: number;
    citizenReportCount: number;
    farmInfluenceIndex: number;
  };
  
  export type ClassificationResult = {
    industrialScore: number;
    vehicularScore: number;
    regionalScore: number;
    farmScore: number;
    label: string;
    confidence: number;
  };
  
  export function classifyStation(
    input: ClassificationInput
  ): ClassificationResult {
    const {
      aqi,
      pm25,
      no2,
      windSpeed,
      industrialDistance,
      trafficIndex,
      nearbyStationSpikeCount,
      citizenReportCount,
      farmInfluenceIndex
    } = input;
  
    const distanceFactor = Math.max(0, 1 - industrialDistance / 10);
    const citizenFactor = Math.min(citizenReportCount / 5, 1);
    const lowTrafficFactor = 1 - trafficIndex;
    const spreadFactor = Math.min(nearbyStationSpikeCount / 5, 1);
    const no2Factor = Math.min(no2 / (pm25 + 1), 1);
    const farmFactor = Math.min(farmInfluenceIndex, 1);
  
    let industrialScore = 0;
    if (aqi > 200) industrialScore += 30;
    industrialScore += 30 * distanceFactor;
    industrialScore += 20 * citizenFactor;
    industrialScore += 10 * lowTrafficFactor;
  
    let vehicularScore = 0;
    vehicularScore += 50 * trafficIndex;
    vehicularScore += 30 * no2Factor;
  
    let regionalScore = 0;
    regionalScore += 50 * spreadFactor;
  
    let farmScore = 0;
    farmScore += 40 * farmFactor;
    farmScore += 30 * spreadFactor;
  
    if (windSpeed < 1) {
      industrialScore *= 0.6;
      regionalScore *= 0.8;
      farmScore *= 0.7;
      vehicularScore += 10;
    }
  
    const scores = {
      industrialScore,
      vehicularScore,
      regionalScore,
      farmScore
    };
  
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
    const [topLabel, topScore] = sorted[0];
    const [, secondScore] = sorted[1];
  
    let label = "Uncertain";
  
    if (topScore >= 30) {
      if (topScore - secondScore < 10) {
        label = "Mixed Contribution";
      } else {
        label =
          topLabel === "industrialScore"
            ? "Likely Industrial"
            : topLabel === "vehicularScore"
            ? "Likely Vehicular"
            : topLabel === "regionalScore"
            ? "Likely Regional Transport"
            : "Likely Agricultural Burning";
      }
    }
  
    let confidence = 0;
  
    if (topScore > 0) {
      confidence = ((topScore - secondScore) / topScore) * 100;
    }
  
    confidence = Math.max(0, Math.min(100, confidence));
  
    return {
      industrialScore: Math.round(industrialScore),
      vehicularScore: Math.round(vehicularScore),
      regionalScore: Math.round(regionalScore),
      farmScore: Math.round(farmScore),
      label,
      confidence: Math.round(confidence)
    };
  }