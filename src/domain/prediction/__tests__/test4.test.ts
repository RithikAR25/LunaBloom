import { CycleEntry } from 'd:/LunaBloom/src/domain/models/Cycle';
import { PredictionEngine } from 'd:/LunaBloom/src/domain/prediction/PredictionEngine';

describe('Calendar exact simulation', () => {
  it('simulates CycleCalendar rendering', () => {
    // Override todayISO just in case
    jest.mock('d:/LunaBloom/src/utils/dateUtils', () => {
      const actual = jest.requireActual('d:/LunaBloom/src/utils/dateUtils');
      return {
        ...actual,
        todayISO: () => '2026-08-13'
      };
    });

    const cycles: CycleEntry[] = [{
      id: '1',
      startDate: '2026-08-11',
      endDate: null,
      cycleLengthDays: null,
      symptoms: []
    }];

    const avgCycleLength = 28;
    const avgPeriodDuration = 5;
    
    const engine = new PredictionEngine();
    
    // Call exactly like CycleCalendar.tsx
    const timelineData = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration);

    console.log("=== INTERVALS ===");
    timelineData.intervals.forEach(i => console.log(`${String(i.phase).padEnd(10)} | ${i.startDate} -> ${i.endDate} | ${i.source}`));

    console.log("\n=== DAYS RENDERING ===");
    for (let i = 11; i <= 20; i++) {
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
  });
});
