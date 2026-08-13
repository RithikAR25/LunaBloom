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
    const referenceDate = '2026-08-11'; // Let's test if today is Aug 11

    const engine = new PredictionEngine();
    const timelineData = engine.generateTimeline(cycles, avgCycleLength, avgPeriodDuration, referenceDate);

    console.log("=== INTERVALS (Ref: Aug 11) ===");
    timelineData.intervals.forEach(i => console.log(`${String(i.phase).padEnd(10)} | ${i.startDate} -> ${i.endDate} | ${i.source}`));
  });
});
