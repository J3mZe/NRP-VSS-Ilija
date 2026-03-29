const db = require('../models');
const weatherService = require('./weatherService');
const varroaRiskService = require('./varroaRiskService');

exports.calculateHiveHealth = async (hiveId) => {
    const hive = await db.Hive.findByPk(hiveId, {
        include: [
            { model: db.HealthRecord, as: 'healthRecords', order: [['createdAt', 'DESC']], limit: 3 }
        ]
    });
    
    if (!hive) throw new Error("Hive not found");

    // Fetch dependent modules
    const varroaRisk = await varroaRiskService.calculateRisk(hive.id);
    const records = hive.healthRecords || [];
    const latestRecord = records.length > 0 ? records[0] : null;
    const notesStr = latestRecord ? ((latestRecord.notes || '') + ' ' + (latestRecord.disease_name || '')).toLowerCase() : '';

    // ==========================================
    // CLINICAL HCC (Healthy Colony Checklist) MODEL
    // Dr. Guidelines: (Brood + Bees + Queen + Food + Stressors + Space) * 100 / 6
    // Each factor mathematically evaluates to strict boolean 1 (Healthy) or 0 (Deficient)
    // ==========================================

    // HCC Component 1: Brood (1 if healthy/present, 0 if issues detected)
    let brood = 1;
    if (notesStr.includes('brez zalege') || notesStr.includes('presledkasta') || notesStr.includes('bolna') || notesStr.includes('gniloba')) {
        brood = 0;
    }

    // HCC Component 2: Bees (1 if numerical strength is adequate, 0 if dangerously weak)
    let bees = 1;
    const currentStrength = hive.strength || 30000;
    if (currentStrength < 20000) {
        bees = 0;
    }

    // HCC Component 3: Queen (1 if active queen is present, 0 if queenless/drone laying)
    let queen = 1;
    if (notesStr.includes('brez matice') || notesStr.includes('trotovka') || notesStr.includes('matičnjak')) {
        queen = 0;
    }

    // HCC Component 4: Food (1 if physical mass reserves are adequate, 0 if borderline starving)
    let food = 1;
    if (hive.weight && hive.weight < 15) {
        food = 0;
    }

    // HCC Component 5: Stressors (1 if isolated from extreme threat, 0 if clinically sick or high varroa)
    let stressors = 1;
    if (varroaRisk.score >= 50 || latestRecord?.status === 'sick' || latestRecord?.status === 'warning') {
        stressors = 0;
    }

    // HCC Component 6: Space (1 if adequate physical layout, 0 if swarming/honeybound constraints detected)
    let space = 1;
    if (notesStr.includes('rojenje') || notesStr.includes('zastoj') || notesStr.includes('premalo prostora')) {
        space = 0;
    }

    // Final Percentage Math Processor
    const totalMet = brood + bees + queen + food + stressors + space;
    let percentMet = Math.round((totalMet * 100) / 6);

    // Apply strict fallback if mathematically 0 but physically existing
    if (percentMet === 0) percentMet = 5; 

    // Legacy Categorical Strength Parsing 
    let strengthClassification = 'Šibke';
    if (percentMet >= 80) strengthClassification = 'Močne';
    else if (percentMet >= 50) strengthClassification = 'Povprečne';

    return {
        id: hive.id,
        name: hive.name,
        // Output raw HCC array for potential future scientific analytics
        hcc: {
            brood,
            bees,
            queen,
            food,
            stressors,
            space
        },
        healthyFlag: totalMet === 6 ? 1 : 0, // Strict Binary compliance
        percentMet: percentMet,
        
        // Proxy mappings anchoring the existing Dashboard UI rendering seamlessly
        totalScore: percentMet,
        strength: strengthClassification,
        varroaRiskScore: varroaRisk.score,
        varroaRiskLevel: varroaRisk.level,
        
        // Stubs keeping older metrics from crashing frontend if parsed
        weatherScore: percentMet,
        forageScore: percentMet,
        inspectionScore: percentMet,
        activityScore: percentMet,
        riskPenalty: stressors === 0 ? 20 : 0
    };
};
