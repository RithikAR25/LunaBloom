import type { IUserProfileRepository } from '../../repositories/IUserProfileRepository';
import type { ICycleRepository } from '../../repositories/ICycleRepository';
import { UserProfile, CycleEntry } from '../../models';
import { DEFAULT_PROFILE } from '../../models/UserProfile';
import { UserGoal } from '../../models/index';
import { generateId } from '../../../utils/dateUtils';

export interface CompleteOnboardingParams {
  preferredName?: string | null;
  dateOfBirth?: string | null;
  avgCycleLength?: number;
  avgPeriodDuration?: number;
  primaryGoal?: UserGoal;
  conditions?: string[];
  lastPeriodDate?: string | null;
  isPeriodActive?: boolean;
}

export class CompleteOnboarding {
  constructor(
    private profileRepo: IUserProfileRepository,
    private cycleRepo: ICycleRepository
  ) {}

  async execute(params: CompleteOnboardingParams): Promise<void> {
    const now = new Date().toISOString();

    const profile: UserProfile = {
      ...DEFAULT_PROFILE,
      id: generateId(),
      preferredName: params.preferredName || null,
      dateOfBirth: params.dateOfBirth || null,
      avgCycleLength: params.avgCycleLength || DEFAULT_PROFILE.avgCycleLength,
      avgPeriodDuration: params.avgPeriodDuration || DEFAULT_PROFILE.avgPeriodDuration,
      primaryGoal: params.primaryGoal || DEFAULT_PROFILE.primaryGoal,
      conditions: (params.conditions as any) || [],
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.profileRepo.save(profile);

    if (params.lastPeriodDate) {
      const cycleId = generateId();
      
      let endDate: string | null = null;
      let durationDays: number | null = null;
      if (!params.isPeriodActive) {
        // If not active, we assume it ended based on the average period duration
        const start = new Date(params.lastPeriodDate);
        start.setDate(start.getDate() + profile.avgPeriodDuration - 1);
        endDate = start.toISOString().split('T')[0] ?? null;
        durationDays = profile.avgPeriodDuration;
      }

      const cycle: CycleEntry = {
        id: cycleId,
        startDate: params.lastPeriodDate,
        endDate: endDate,
        durationDays: durationDays,
        cycleLengthDays: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        syncStatus: 'LOCAL',
      };

      await this.cycleRepo.save(cycle);
    }
  }
}
