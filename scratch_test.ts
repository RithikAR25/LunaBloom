import { CycleEntry } from './src/domain/models/Cycle';
import { PredictionEngine } from './src/domain/prediction/PredictionEngine';

const cycles = [{
  id: '1',
  startDate: '2026-08-12',
  endDate: null,
  cycleLengthDays: null
}] as unknown as CycleEntry[];

const avgCycleLength = 28;
const avgPeriodDuration = 5;

const engine = new PredictionEngine();

// Override todayISO manually? 
// No, I can't easily mock it without jest. But I can pass '2026-08-14' as referenceDate.
const timelineData = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration, '2026-08-14');

console.log("=== INTERVALS ===");
timelineData.intervals.forEach(i => console.log(`${String(i.phase).padEnd(10)} | ${i.startDate} -> ${i.endDate} | ${i.source}`));

console.log("\n=== DAYS RENDERING ===");
for (let i = 12; i <= 21; i++) {
  const d = new Date(Date.UTC(2026, 7, i)); // August is 7
  const dateStr = d.toISOString().split('T')[0]!;
  
  const phaseInfo = engine.getPhaseForDate(dateStr, timelineData);
  
  let state = 'none';
  if (phaseInfo.isPredictedMenstrual) {
    state = 'predicted_menstrual';
  } else {
    switch (phaseInfo.phase) {
      case 'MENSTRUAL': state = 'menstrual'; break;
      case 'FOLLICULAR': state = 'follicular'; break;
      case 'OVULATION': state = 'ovulatory'; break;
      case 'LUTEAL': state = 'luteal'; break;
    }
  }

  console.log(`${dateStr} -> ${state} (phase: ${phaseInfo.phase}, source: ${phaseInfo.source})`);
}
