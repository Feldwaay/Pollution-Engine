export type SpikeDetectionInput = {
    currentAQI: number;
    historicalAQI: number[]; // last N readings (e.g., 12 readings for 1 hour)
  };
  
  export type SpikeDetectionResult = {
    isSpike: boolean;
    reason: string;
    rollingAverage: number;
  };
  
  export function detectSpike(
    input: SpikeDetectionInput
  ): SpikeDetectionResult {
    const { currentAQI, historicalAQI } = input;
  
    if (!historicalAQI || historicalAQI.length === 0) {
      return {
        isSpike: false,
        reason: "Insufficient historical data",
        rollingAverage: 0
      };
    }
  
    const rollingAverage =
      historicalAQI.reduce((sum, value) => sum + value, 0) /
      historicalAQI.length;
  
    const relativeThreshold = rollingAverage * 1.3;
    const absoluteThreshold = 200;
  
    if (currentAQI > relativeThreshold) {
      return {
        isSpike: true,
        reason: "Relative spike (>1.3x rolling average)",
        rollingAverage
      };
    }
  
    if (currentAQI > absoluteThreshold) {
      return {
        isSpike: true,
        reason: "Absolute AQI threshold exceeded (>200)",
        rollingAverage
      };
    }
  
    return {
      isSpike: false,
      reason: "No spike detected",
      rollingAverage
    };
  }
  