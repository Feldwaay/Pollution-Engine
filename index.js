function classifyStation(input) {
    const {
      aqi,
      pm25,
      no2,
      windSpeed,
      windDirection,
      industrialDistance,
      trafficIndex,
      nearbyStationSpikeCount,
      citizenReportCount
    } = input;
  
    let industrialScore = 0;
    let vehicularScore = 0;
    let regionalScore = 0;
  
    // INDUSTRIAL LOGIC
    if (aqi > 200 && industrialDistance < 5) {
      industrialScore += 40;
    }
  
    if (citizenReportCount > 2) {
      industrialScore += 20;
    }
  
    if (trafficIndex < 0.4) {
      industrialScore += 10;
    }
  
    // VEHICULAR LOGIC
    if (trafficIndex > 0.7) {
      vehicularScore += 40;
    }
  
    if (no2 > pm25) {
      vehicularScore += 20;
    }
  
    // REGIONAL LOGIC
    if (nearbyStationSpikeCount > 3) {
      regionalScore += 50;
    }
  
    // LOW WIND STAGNATION CHECK
    if (windSpeed < 1) {
      industrialScore *= 0.5;
      regionalScore *= 0.7;
    }
  
    const scores = {
      industrialScore,
      vehicularScore,
      regionalScore
    };
  
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
    const top = sorted[0];
    const second = sorted[1];
  
    let label = "Uncertain";
  
    if (top[1] >= 40) {
      if (top[1] - second[1] < 10) {
        label = "Mixed Contribution";
      } else {
        label =
          top[0] === "industrialScore"
            ? "Likely Industrial"
            : top[0] === "vehicularScore"
            ? "Likely Vehicular"
            : "Likely Regional Transport";
      }
    }
  
    const confidence = Math.max(0, top[1] - second[1]);
  
    return {
      ...scores,
      label,
      confidence
    };
  }
  



  //test data
  const testStation = {
    aqi: 310,
    pm25: 200,
    no2: 50,
    windSpeed: 3,
    windDirection: 90,
    industrialDistance: 2,
    trafficIndex: 0.3,
    nearbyStationSpikeCount: 5,
    citizenReportCount: 4
  };
  
  const result = classifyStation(testStation);
  
  console.log(result);
  
