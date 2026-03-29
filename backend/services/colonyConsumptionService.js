exports.estimateDailyConsumptionGrams = (beeCount, avgTempC, seasonIdx) => {
    // Math model: base metabolism + heating/cooling tax 
    const basePer10k = 25; // 25g/day/10k bees absolute baseline
    let totalBase = (beeCount / 10000) * basePer10k;
    
    let multiplier = 1.0;
    
    // Seasonal metabolic changes
    if (seasonIdx >= 2 && seasonIdx <= 5) {
        multiplier += 0.8; // Spring massive brood rearing consumes heavy food
    } else if (seasonIdx >= 6 && seasonIdx <= 7) {
        // Summer maintenance
        multiplier += 0.4;
    } else if (seasonIdx >= 8 && seasonIdx <= 10) {
        // Autumn prepping
        multiplier += 0.2;
    } else {
        // Winter cluster
        multiplier = 0.5; // Very low movement
    }
    
    // Temperature tax (fanning in heat, clustering in cold)
    if (avgTempC < 5) {
        multiplier += 0.5; // Burning honey for heat
    } else if (avgTempC > 30) {
        multiplier += 0.2; // Fanning for cooling requires energy
    }

    return Math.round(totalBase * multiplier);
};
