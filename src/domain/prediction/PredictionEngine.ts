import { CyclePredictionService } from './services/CyclePredictionService';
import { TimelineBuilder } from './services/TimelineBuilder';
import { PhaseResolver, PhaseInfo } from './services/PhaseResolver';
import { TimelineIndexer } from './services/TimelineIndexer';
import { CycleEntry } from '../models/Cycle';
import { TimelineEvent } from './models/TimelineEvent';
import { DashboardMetricsBuilder } from './services/DashboardMetricsBuilder';
import { PredictionSummary } from './models/PredictionSummary';
import { PhaseInterval } from './models/PhaseInterval';
import { todayISO } from '../../utils/dateUtils';

export interface TimelineData {
  events: TimelineEvent[];
  intervals: PhaseInterval[];
  index: Map<string, TimelineEvent[]>;
  dashboardInfo: PredictionSummary | null;
}

export class PredictionEngine {
  private predictionService: CyclePredictionService;
  private builder: TimelineBuilder;
  private indexer: TimelineIndexer;
  private resolver: PhaseResolver;
  private dashboardBuilder: DashboardMetricsBuilder;

  constructor() {
    this.predictionService = new CyclePredictionService();
    this.builder = new TimelineBuilder(this.predictionService);
    this.indexer = new TimelineIndexer();
    this.resolver = new PhaseResolver();
    this.dashboardBuilder = new DashboardMetricsBuilder();
  }

  /**
   * Generates a fully indexed timeline of events and intervals based on logged cycles and predictions.
   * This facade method encapsulates the entire prediction and timeline generation pipeline.
   */
  public generateTimeline(cycles: CycleEntry[], avgCycleLength: number, avgPeriodDuration: number, referenceDate: string = todayISO()): TimelineData {
    if (cycles.length === 0) return { events: [], intervals: [], index: new Map(), dashboardInfo: null };

    const prediction = this.predictionService.predict(cycles, avgCycleLength, avgPeriodDuration);
    
    const { events, intervals } = this.builder.build(cycles, prediction, referenceDate, avgPeriodDuration);
    const index = this.indexer.buildDateIndex(events);
    const dashboardInfo = this.dashboardBuilder.build(referenceDate, prediction);

    return { events, intervals, index, dashboardInfo };
  }

  /**
   * Resolves the cycle phase for a specific date using the generated phase intervals.
   */
  public getPhaseForDate(dateStr: string, timeline: TimelineData): PhaseInfo {
    return this.resolver.getPhaseForDate(dateStr, timeline.intervals, timeline.index);
  }
}
