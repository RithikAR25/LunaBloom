const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const START_DATE = new Date('2024-01-01T00:00:00Z');
const END_DATE = new Date(); // now

const PROFILE_ID = '72dfba5b-fd0b-467d-85d7-579b93db72c5';

const MOODS = ['mood_happy', 'mood_anxious', 'mood_mood_swings', 'mood_energetic', 'mood_focused', 'mood_calm', 'mood_distracted'];
const SYMPTOMS = ['symp_bloating', 'symp_cravings', 'symp_nausea', 'symp_cramps', 'symp_tender_breasts', 'symp_acne', 'symp_backache'];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomSample = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const formatDate = (date) => date.toISOString().split('T')[0];
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// 1. Profile
const profile = {
  id: PROFILE_ID,
  preferredName: 'Tester',
  dateOfBirth: '1995-05-15',
  heightCm: 165,
  weightKg: 60,
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  primaryGoal: 'TRACK_CYCLE',
  conditions: [],
  birthControlType: 'NONE',
  trackingMode: 'CYCLE',
  learnModeEnabled: true,
  onboardingCompleted: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  syncStatus: 'LOCAL'
};

// 2. Cycles
const cycles = [];
let currentCycleStart = new Date(START_DATE);

while (currentCycleStart < END_DATE) {
  const cycleLengthDays = randomInt(26, 32);
  const durationDays = randomInt(4, 6);
  
  const cycleEndDateStr = formatDate(addDays(currentCycleStart, durationDays - 1));
  
  const isHistoric = addDays(currentCycleStart, cycleLengthDays - 1) < END_DATE;
  
  const cycle = {
    id: crypto.randomUUID(),
    startDate: formatDate(currentCycleStart),
    endDate: isHistoric ? cycleEndDateStr : null,
    durationDays: isHistoric ? durationDays : null,
    cycleLengthDays: isHistoric ? cycleLengthDays : null,
    notes: null,
    isExcludedFromPredictions: false,
    createdAt: currentCycleStart.toISOString(),
    updatedAt: currentCycleStart.toISOString(),
    deletedAt: null,
    syncStatus: 'LOCAL'
  };
  
  cycles.push(cycle);
  currentCycleStart = addDays(currentCycleStart, cycleLengthDays);
}

// 3. Daily Logs
const dailyLogs = [];

let currentMonthCursor = new Date(START_DATE);
currentMonthCursor.setDate(1);

while (currentMonthCursor < END_DATE) {
  const year = currentMonthCursor.getFullYear();
  const month = currentMonthCursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const daysToLog = randomInt(15, 25);
  
  const allDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const selectedDays = randomSample(allDays, daysToLog).sort((a,b) => a - b);
  
  for (const day of selectedDays) {
    const logDate = new Date(Date.UTC(year, month, day));
    if (logDate > END_DATE) continue;
    if (logDate < START_DATE) continue;
    
    const dateStr = formatDate(logDate);
    
    const matchedCycle = cycles.find(c => {
      const cycleEnd = c.cycleLengthDays 
        ? addDays(new Date(c.startDate), c.cycleLengthDays - 1) 
        : END_DATE;
      return logDate >= new Date(c.startDate) && logDate <= cycleEnd;
    });
    
    let cycleEntryId = null;
    let cycleDay = null;
    let flowIntensity = null;
    
    if (matchedCycle) {
      cycleEntryId = matchedCycle.id;
      cycleDay = Math.floor((logDate - new Date(matchedCycle.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      
      if (cycleDay <= (matchedCycle.durationDays || 5)) {
        flowIntensity = randomSample(['LIGHT', 'MEDIUM', 'HEAVY'], 1)[0];
      }
    }
    
    dailyLogs.push({
      id: crypto.randomUUID(),
      date: dateStr,
      cycleEntryId,
      cycleDay,
      flowIntensity,
      symptoms: randomSample(SYMPTOMS, randomInt(0, 3)),
      moods: randomSample(MOODS, randomInt(1, 3)),
      painLevel: flowIntensity ? randomInt(4, 9) : (Math.random() > 0.5 ? randomInt(1, 3) : null),
      energyLevel: randomInt(1, 5),
      sleepQuality: randomInt(1, 5),
      sleepHours: randomInt(5, 9),
      waterIntakeLiters: Number((Math.random() * 2 + 1).toFixed(1)),
      exerciseMinutes: Math.random() > 0.7 ? randomInt(20, 60) : null,
      exerciseType: null,
      libidoLevel: randomInt(1, 3),
      notes: null,
      createdAt: logDate.toISOString(),
      updatedAt: logDate.toISOString(),
      deletedAt: null,
      syncStatus: 'LOCAL'
    });
  }
  
  currentMonthCursor.setMonth(currentMonthCursor.getMonth() + 1);
}

const payload = {
  version: 1,
  exportDate: new Date().toISOString(),
  data: {
    profile,
    cycles,
    dailyLogs
  }
};

const outputDir = path.join(__dirname, '../docs/assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'LunaBloom_Mock_Backup_2024_2026.json');
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

console.log(`Generated mock backup with ${cycles.length} cycles and ${dailyLogs.length} daily logs.`);
console.log(`Output saved to: ${outputPath}`);
