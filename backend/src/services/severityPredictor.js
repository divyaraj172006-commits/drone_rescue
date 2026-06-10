export function predictSeverity({ type, rainfall, windSpeed, populationDensity, waterLevel }) {
  let score = 0;
  const details = {};

  // Convert inputs to numbers
  const r = parseFloat(rainfall) || 0;
  const w = parseFloat(windSpeed) || 0;
  const p = parseFloat(populationDensity) || 0;
  const wl = parseFloat(waterLevel) || 0;

  if (type === 'flood') {
    // Rain weight: 0.35, Water level weight: 0.45, Population density weight: 0.20
    const rainScore = Math.min(100, (r / 200) * 100) * 0.35; // Maxes out at 200mm
    const waterScore = Math.min(100, (wl / 5) * 100) * 0.45; // Maxes out at 5m
    const popScore = Math.min(100, (p / 3000) * 100) * 0.20; // Maxes out at 3000 people/km²
    score = rainScore + waterScore + popScore;

    details.breakdown = {
      rainfallContribution: Math.round(rainScore),
      waterLevelContribution: Math.round(waterScore),
      populationDensityContribution: Math.round(popScore)
    };
  } else if (type === 'wildfire') {
    // Wind weight: 0.50, Population density weight: 0.20, Rain penalty: -0.30
    const windScore = Math.min(100, (w / 80) * 100) * 0.50; // Maxes out at 80 km/h
    const popScore = Math.min(100, (p / 2000) * 100) * 0.20; // Maxes out at 2000 people/km²
    const rainPenalty = Math.min(100, (r / 50) * 100) * 0.30; // High rain decreases fire severity
    
    score = Math.max(10, windScore + popScore - rainPenalty + 30); // 30 is baseline fire hazard

    details.breakdown = {
      windContribution: Math.round(windScore),
      populationDensityContribution: Math.round(popScore),
      rainDampeningPenalty: Math.round(rainPenalty)
    };
  } else if (type === 'hurricane') {
    // Wind weight: 0.50, Water/Rain weight: 0.30, Population density weight: 0.20
    const windScore = Math.min(100, (w / 180) * 100) * 0.50; // Maxes out at 180 km/h (Category 5 is >250, but 180 is extreme)
    const waterRainScore = Math.min(100, (((r / 150) + (wl / 4)) / 2) * 100) * 0.30;
    const popScore = Math.min(100, (p / 4000) * 100) * 0.20;
    
    score = windScore + waterRainScore + popScore;

    details.breakdown = {
      windContribution: Math.round(windScore),
      stormSurgeAndRainContribution: Math.round(waterRainScore),
      populationDensityContribution: Math.round(popScore)
    };
  } else if (type === 'earthquake') {
    // Population weight: 0.50, Water Level/Earth movement impact weight: 0.20, Wind speed is ignored.
    // Simulate high baseline since earthquakes are inherently severe
    const baseline = 40;
    const popScore = Math.min(100, (p / 5000) * 100) * 0.40;
    const secondaryHazards = Math.min(100, (wl / 3) * 100) * 0.20; // Can trigger tsunamis if water level changes
    
    score = baseline + popScore + secondaryHazards;

    details.breakdown = {
      baselineTectonicThreat: baseline,
      populationExposureContribution: Math.round(popScore),
      secondaryMaritimeRisk: Math.round(secondaryHazards)
    };
  } else {
    // Fallback default calculation
    score = 30;
    details.breakdown = { baseline: 30 };
  }

  score = Math.min(100, Math.max(5, score));

  let severity = 'low';
  if (score >= 85) {
    severity = 'critical';
  } else if (score >= 60) {
    severity = 'high';
  } else if (score >= 30) {
    severity = 'medium';
  }

  return {
    score: Math.round(score),
    severity,
    details
  };
}
