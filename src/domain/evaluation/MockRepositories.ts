import { ICycleRepository } from '../repositories/ICycleRepository';
import { IDailyLogRepository } from '../repositories/IDailyLogRepository';
import { IUserProfileRepository } from '../repositories/IUserProfileRepository';
import { CycleEntry, DailyLog, UserProfile } from '../models';

export class MockCycleRepository implements ICycleRepository {
  constructor(private cycles: CycleEntry[]) {}

  async getAll(): Promise<CycleEntry[]> { return this.cycles; }
  async getLastN(n: number): Promise<CycleEntry[]> { return this.cycles.slice(-n); }
  async getById(_id: string): Promise<CycleEntry | null> { return this.cycles.find(c => c.id === _id) || null; }
  async save(_cycle: CycleEntry): Promise<void> {}
  async update(_id: string, _data: Partial<CycleEntry>): Promise<void> {}
  async delete(_id: string): Promise<void> {}
  async softDelete(_id: string): Promise<void> {}
  async getActiveCycle(): Promise<CycleEntry | null> { return this.cycles.length ? (this.cycles[this.cycles.length - 1] || null) : null; }
}

export class MockDailyLogRepository implements IDailyLogRepository {
  constructor(private logs: DailyLog[]) {}

  async getAll(): Promise<DailyLog[]> { return this.logs; }
  async getById(_id: string): Promise<DailyLog | null> { return this.logs.find(l => l.id === _id) || null; }
  async getByDate(_date: string): Promise<DailyLog | null> { return this.logs.find(l => l.date === _date) || null; }
  async getByCycleId(_cycleId: string): Promise<DailyLog[]> { return this.logs; }
  async getRange(_startDate: string, _endDate: string): Promise<DailyLog[]> { return this.logs; }
  async save(_log: DailyLog): Promise<void> {}
  async update(_id: string, _data: Partial<DailyLog>): Promise<void> {}
  async delete(_date: string): Promise<void> {}
  async softDelete(_date: string): Promise<void> {}
}

export class MockUserProfileRepository implements IUserProfileRepository {
  constructor(private profile: UserProfile | null) {}

  async get(): Promise<UserProfile | null> { return this.profile; }
  async save(_profile: UserProfile): Promise<void> {}
  async update(_profile: UserProfile): Promise<void> {}
}
