const db = require('../models');

// Helper functions for varroa risk factors
const getSeasonRisk = (month) => {
    // Varroa population peaks in late summer/autumn (August, September, October)
    if (month >= 7 && month <= 9) return 25; // High risk late summer
    if (month >= 4 && month <= 6) return 15; // Med risk spring/summer
    return 5; // Low risk winter
};

const getInspectionDelayRisk = (lastInspectionDate) => {
    if (!lastInspectionDate) return 15; // No inspections = risk
    const daysSince = Math.floor((new Date() - new Date(lastInspectionDate)) / (1000 * 60 * 60 * 24));
    if (daysSince > 45) return 20;
    if (daysSince > 21) return 10;
    return 0; // Recently inspected
};

const getTreatmentDelayRisk = (records) => {
    if (!records || records.length === 0) return 20;
    
    // Find last treatment based on keyword heuristics
    const treatmentRecord = records.find(r => 
        (r.notes && r.notes.toLowerCase().includes('tretira')) || 
        (r.disease_name && r.disease_name.toLowerCase().includes('zdravljenje')) ||
        (r.notes && r.notes.toLowerCase().includes('kislina'))
    );
    
    if (!treatmentRecord) return 20; // Never explicitly treated
    
    const daysSince = Math.floor((new Date() - new Date(treatmentRecord.inspection_date)) / (1000 * 60 * 60 * 24));
    if (daysSince > 180) return 25; // 6 months without treatment
    if (daysSince > 90) return 10;
    return 0; // Recently treated
};

const getBroodActivityRisk = (records) => {
    if (!records || records.length === 0) return 5;
    const latest = records[0];
    if (latest.notes && latest.notes.toLowerCase().includes('zalega strnjena')) return 10; // Lots of brood = more varroa reproduction
    if (latest.notes && latest.notes.toLowerCase().includes('brez zalege')) return 0; // No brood break = varroa break
    return 5;
};

const getColonyWeaknessRisk = (hive) => {
    // Weaker colonies succumb to Varroa faster
    if (!hive) return 10;
    const strength = hive.strength || 50000; 
    if (strength < 20000) return 15; 
    if (strength < 40000) return 5;
    return 0; // Strong colonies handle baseline loads better
};

const getObservationRisk = (records) => {
    if (!records || records.length === 0) return 0;
    let risk = 0;
    records.slice(0, 3).forEach(r => {
        const txt = ((r.notes || '') + ' ' + (r.disease_name || '')).toLowerCase();
        if (txt.includes('varoj') || txt.includes('varoa') || txt.includes('pršic')) risk += 25; // Explicit varroa hit
        if (txt.includes('deformira') || txt.includes('krila')) risk += 30; // DWV visible (critical stage)
        if (txt.includes('presledkasta zalega')) risk += 10; // Patchy brood
    });
    return Math.min(risk, 40); // Cap observation risk
};

const getRiskLabelMapping = (score) => {
    if (score >= 70) return 'Visoko';
    if (score >= 40) return 'Srednje';
    return 'Nizko';
};

const getRecommendation = (level) => {
    if (level === 'Visoko') return "Takojšnje zdravljenje neizbežno. Aplicirajte dovoljeno varoicidno sredstvo. Preverite poškodbe na zalegi.";
    if (level === 'Srednje') return "Priporočen natančen diagnostični poseg (npr. sladkorni posip ali testiranja na naravni odpad). Pripravite se na jesensko tretiranje.";
    return "Sistematičnih tveganj ni. Vzdržujte preventivne higienske standarde pri delu s panjem.";
};

exports.calculateRisk = async (hiveId) => {
    const hive = await db.Hive.findByPk(hiveId, {
        include: [{ model: db.HealthRecord, as: 'healthRecords' }]
    });

    if (!hive) {
        throw new Error("Hive not mathematically resolved");
    }

    const records = hive.healthRecords ? hive.healthRecords.sort((a,b) => new Date(b.inspection_date) - new Date(a.inspection_date)) : [];
    const latestRecord = records.length > 0 ? records[0] : null;

    const currentMonth = new Date().getMonth();

    const factors = {
        seasonRisk: getSeasonRisk(currentMonth),
        inspectionDelayRisk: getInspectionDelayRisk(latestRecord?.inspection_date),
        treatmentDelayRisk: getTreatmentDelayRisk(records),
        broodActivityRisk: getBroodActivityRisk(records),
        colonyWeaknessRisk: getColonyWeaknessRisk(hive),
        observationRisk: getObservationRisk(records)
    };

    let totalScore = Object.values(factors).reduce((acc, val) => acc + val, 0);
    // Cap strictly at 100 max
    totalScore = Math.min(100, Math.max(0, totalScore));

    const level = getRiskLabelMapping(totalScore);

    return {
        score: totalScore,
        level: level,
        factors: factors,
        recommendation: getRecommendation(level)
    };
};
