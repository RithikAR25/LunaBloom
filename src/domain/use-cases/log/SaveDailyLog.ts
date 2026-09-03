import type { IDailyLogRepository } from '../../repositories/IDailyLogRepository';
import type { DailyLog } from '../../models/DailyLog';
import { generateId, nowISO, todayISO, isValidISODate, isAfter } from '../../../utils/dateUtils';
import type { CycleEntry } from '../../models/Cycle';
import { ValidationError } from '../../errors';

export class SaveDailyLog {
  constructor(private dailyLogRepository: IDailyLogRepository) {}

  public async execute(
    date: string = todayISO(),
    logData: Partial<DailyLog>,
    activeCycle: CycleEntry | null
  ): Promise<DailyLog> {
    if (!isValidISODate(date)) {
      throw new ValidationError('Invalid date format.', 'date');
    }

    if (isAfter(date, todayISO())) {
      throw new ValidationError('Cannot log data for future dates.', 'date');
    }

    const existingLog = await this.dailyLogRepository.getByDate(date);
    
    if (existingLog) {
      // Update existing log
      await this.dailyLogRepository.update(existingLog.id, logData);
      return (await this.dailyLogRepository.getById(existingLog.id))!;
    }

    const now = nowISO();
    let cycleDay: number | null = null;

    if (activeCycle && date >= activeCycle.startDate) {
      // Calculate cycle day (1-indexed)
      const msPerDay = 1000 * 60 * 60 * 24;
      const startMs = new Date(activeCycle.startDate).getTime();
      const currentMs = new Date(date).getTime();
      cycleDay = Math.floor((currentMs - startMs) / msPerDay) + 1;
    }

    const newLog: DailyLog = {
      id: generateId(),
      date,
      cycleEntryId: activeCycle ? activeCycle.id : null,
      cycleDay,
      flowIntensity: logData.flowIntensity ?? null,
      symptoms: logData.symptoms ?? [],
      moods: logData.moods ?? [],
      painLevel: logData.painLevel ?? null,
      energyLevel: logData.energyLevel ?? null,
      sleepQuality: logData.sleepQuality ?? null,
      sleepHours: logData.sleepHours ?? null,
      waterIntakeLiters: logData.waterIntakeLiters ?? null,
      exerciseMinutes: logData.exerciseMinutes ?? null,
      exerciseType: logData.exerciseType ?? null,
      libidoLevel: logData.libidoLevel ?? null,
      notes: logData.notes ?? null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: 'LOCAL',
    };

    await this.dailyLogRepository.save(newLog);

    return newLog;
  }
}
