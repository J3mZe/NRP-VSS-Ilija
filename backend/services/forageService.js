const forageProfilesByMonth = {
    0: { base: 0, label: 'Brez paše' },        // Jan
    1: { base: 5, label: 'Zelo slabo' },       // Feb
    2: { base: 20, label: 'Zgodnje spomladansko' }, // Mar
    3: { base: 60, label: 'Spomladansko' },    // Apr
    4: { base: 95, label: 'Glavna paša' },     // May
    5: { base: 85, label: 'Odlično' },         // Jun
    6: { base: 70, label: 'Dobra paša' },      // Jul
    7: { base: 45, label: 'Zadnja paša' },     // Aug
    8: { base: 25, label: 'Jesensko' },        // Sep
    9: { base: 10, label: 'Zaključek' },       // Okt
    10: { base: 0, label: 'Brez paše' },       // Nov
    11: { base: 0, label: 'Brez paše' }        // Dec
};

exports.getForagePotential = (monthIndex, weatherScore) => {
    // Determine natural flora potential based entirely on calendar constraints
    let profile = forageProfilesByMonth[monthIndex] || forageProfilesByMonth[0];
    let potential = profile.base;
    
    // Severely restrict foraging if weather conditions drop below flying thresholds (rain/cold map)
    if (weatherScore < 40) {
        potential = Math.round(potential * 0.2); // Bees forced inside
    } else if (weatherScore < 60) {
        potential = Math.round(potential * 0.6); // Interrupted flights
    } else if (weatherScore > 90) {
        potential = Math.round(potential * 1.1); // Perfect soaring
    }
    
    // Mathematical boundary safety
    return {
        score: Math.min(100, Math.max(0, potential)),
        label: profile.label
    };
};
