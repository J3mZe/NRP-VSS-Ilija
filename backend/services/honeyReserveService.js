const db = require('../models');
const forageService = require('./forageService');
const colonyConsumptionService = require('./colonyConsumptionService');
const weatherService = require('./weatherService'); 

exports.generateDailyDelta = async (hiveId) => {
    const hive = await db.Hive.findByPk(hiveId);
    if (!hive) throw new Error("Hive not found");
    
    // Look for latest sequence array
    const lastRecord = await db.HiveReserveRecord.findOne({
        where: { hiveId },
        order: [['date', 'DESC']]
    });

    const reserveStartGrams = lastRecord ? lastRecord.reserveEndGrams : (hive.weight ? Math.round(hive.weight * 1000 * 0.4) : 8000); 
    const estimatedBees = lastRecord ? lastRecord.estimatedBees : ((hive.strength || 5) * 6000); // Approx 6k bees per strength unit
    
    const date = new Date();
    const month = date.getMonth();
    const weatherScore = await weatherService.getWeatherScore(hive.location);
    const avgTempC = (weatherScore > 60) ? 22 : 12; // Static estimation hook since real weather temp isn't hooked deeply yet
    
    // Core Delta Engines
    const forageData = forageService.getForagePotential(month, weatherScore);
    const consumptionGrams = colonyConsumptionService.estimateDailyConsumptionGrams(estimatedBees, avgTempC, month);
    
    // Synthesized Gain formula: Forage Potential * Bee Foraging Force
    let reserveGainGrams = 0;
    
    // Biological flight logic: No flights in deep winter, minimal in March
    let activeForagerPct = 0.3;
    if (month === 11 || month <= 1) activeForagerPct = 0.0; // Dec, Jan, Feb
    else if (month === 2) activeForagerPct = 0.05; // March
    
    if (forageData.score >= 10 && activeForagerPct > 0) {
        const foragers = estimatedBees * activeForagerPct;
        reserveGainGrams = Math.round((forageData.score * foragers) / 1000);
    }
    
    const netDelta = reserveGainGrams - consumptionGrams;
    const reserveEndGrams = Math.max(0, reserveStartGrams + netDelta);
    
    const record = await db.HiveReserveRecord.create({
        hiveId: hive.id,
        date: date.toISOString().split('T')[0],
        estimatedBees,
        reserveStartGrams,
        reserveGainGrams,
        reserveLossGrams: consumptionGrams,
        reserveEndGrams,
        weatherScore,
        forageScore: forageData.score
    });
    
    return record;
};

exports.seedHistoryIfEmpty = async (hiveId) => {
    const records = await db.HiveReserveRecord.count({ where: { hiveId }});
    // Dynamically regenerate history if it doesn't align with manual overrides (We drop generic demo history for real sync)
    // Actually, simply using the hive.weight explicitly for the seeder mathematically guarantees sync for the current node.
    
    // We forcefully delete old generics to sync the live edits when requested by the UI
    await db.HiveReserveRecord.destroy({ where: { hiveId }});
    
    const hive = await db.Hive.findByPk(hiveId);
    // Explicitly mapping 100% of the Scale weight to avoid user confusion over biology algorithms
    let currentGrams = hive.weight ? Math.round(hive.weight * 1000) : 15000; 
    
    // Mathematically derive population size natively from physical scale mass if manually unspecified OR if the DB contains legacy 1-10 values
    let currentBees = hive.strength;
    
    // Explicit Fallback mapping ensuring math guarantees if bees count wasn't properly assigned (less than 100 bees usually means legacy schema)
    if (!currentBees || currentBees <= 100) {
        if (hive.weight >= 25) currentBees = 48000;
        else if (hive.weight >= 12) currentBees = 30000;
        else currentBees = 18000; // Small weak colonies or nucs
    }
    
    // Bounds check to guarantee mathematically we DO NOT calculate reserves for days before the physical box was constructed!
    const createdDate = new Date(hive.createdAt);
    let baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);
    
    if (baseDate < createdDate) {
        baseDate = new Date(createdDate);
    }
    
    // Safety check strictly evaluating physical elapsed days
    const daysToSimulate = Math.max(1, Math.floor((new Date() - baseDate) / 86400000));
    
    for(let i=0; i < daysToSimulate; i++) {
        const loopDate = new Date(baseDate);
        loopDate.setDate(baseDate.getDate() + i);
        const m = loopDate.getMonth();
        
        const fd = forageService.getForagePotential(m, 85);
        const cg = colonyConsumptionService.estimateDailyConsumptionGrams(currentBees, 12, m);
        
        let rg = 0;
        let flightForce = 0.3;
        if (m === 11 || m <= 1) flightForce = 0.0;
        else if (m === 2) flightForce = 0.05;
        
        if (fd.score >= 10 && flightForce > 0) {
            rg = Math.round((fd.score * (currentBees * flightForce)) / 1000);
        }

        const netDaily = rg - cg;
        currentGrams = Math.max(0, currentGrams + netDaily);
        
        await db.HiveReserveRecord.create({
            hiveId: hiveId,
            date: loopDate.toISOString().split('T')[0],
            estimatedBees: currentBees,
            reserveStartGrams: currentGrams - netDaily,
            reserveGainGrams: rg,
            reserveLossGrams: cg,
            reserveEndGrams: currentGrams,
            weatherScore: 85,
            forageScore: fd.score
        });
    }
}
