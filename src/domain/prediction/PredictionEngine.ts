import { CyclePredictionService } from './services/CyclePredictionService';
import { TimelineBuilder } from './services/TimelineBuilder';
import { PhaseResolver, PhaseInfo } from './services/PhaseResolver';
import { TimelineIndexer } from './services/TimelineIndexer';
import { CycleEntry } from '../models/Cycle';
import { TimelineEvent } from './models/TimelineEvent';

export interface TimelineData {
  events: TimelineEvent[];
  index: Map<string, TimelineEvent[]>;
}

export class PredictionEngine {
  private predictionService: CyclePredictionService;
  private builder: TimelineBuilder;
  private indexer: TimelineIndexer;
  private resolver: PhaseResolver;

  constructor() {
    this.predictionService = new CyclePredictionService();
    this.builder = new TimelineBuilder();
    this.indexer = new TimelineIndexer();
    this.resolver = new PhaseResolver();
  }

  /**
   * Generates a fully indexed timeline of events based on logged cycles and predictions.
   * This facade method encapsulates the entire prediction and timeline generation pipeline.
   */
  public generateTimeline(cycles: CycleEntry[], avgCycleLength: number, avgPeriodDuration: number): TimelineData {
    if (cycles.length === 0) return { events: [], index: new Map() };
    
    const sorted = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const latest = sorted[0];

    if (!latest) return { events: [], index: new Map() };

    const predictionResult = this.predictionService.predictNextPeriod(sorted, avgCycleLength);
    const projections = this.predictionService.generateFutureCycles(latest, predictionResult, avgPeriodDuration);
    
    const events = this.builder.generateTimeline(sorted, projections);
    const index = this.indexer.buildDateIndex(events);

    return { events, index };
  }

  /**
   * Resolves the cycle phase for a specific date using the generated timeline data.
   */
  public getPhaseForDate(dateStr: string, timeline: TimelineData): PhaseInfo {
    const activeEvents = timeline.index.get(dateStr) || [];
    return this.resolver.getPhaseForDate(dateStr, activeEvents, timeline.events);
  }
}
