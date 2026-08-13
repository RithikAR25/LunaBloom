import { CycleEntry } from 'd:/LunaBloom/src/domain/models/Cycle';
import { PredictionEngine } from 'd:/LunaBloom/src/domain/prediction/PredictionEngine';
import { TimelineBuilder } from 'd:/LunaBloom/src/domain/prediction/services/TimelineBuilder';
import { CyclePredictionService } from 'd:/LunaBloom/src/domain/prediction/services/CyclePredictionService';

describe('Scratch test', () => {
  it('runs', () => {
    const cycles: CycleEntry[] = [{
      id: '1',
      startDate: '2026-08-11',
      endDate: null,
      cycleLengthDays: null,
      symptoms: []
    }];

    const avgCycleLength = 28;
    const avgPeriodDuration = 5;
    const referenceDate = '2026-08-13';

    const engine = new PredictionEngine();
    const timelineData = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration, referenceDate);

    console.log("=== INTERVALS ===");
    timelineData.intervals.forEach(i => console.log(`${String(i.phase).padEnd(10)} | ${i.startDate} -> ${i.endDate} | ${i.source}`));

    console.log("\n=== CALENDAR DAYS ===");
    for (let day = 11; day <= 20; day++) {
      const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
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
      console.log(`${dateStr} | Phase: ${phaseInfo.phase} | Source: ${phaseInfo.source} | isPredMenstrual: ${phaseInfo.isPredictedMenstrual} | State: ${state}`);
    }
  });
});
