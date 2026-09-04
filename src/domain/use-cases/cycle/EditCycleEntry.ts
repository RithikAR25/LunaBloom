import type { ICycleRepository } from '../../repositories/ICycleRepository';
import type { CycleEntry } from '../../models/Cycle';
import { daysBetween, isBefore, addDays } from '../../../utils/dateUtils';
import type { ValidationService } from '../../services/ValidationService';
import { ValidationError, MergeRequiredError } from '../../errors';

export class EditCycleEntry {
  constructor(
    private cycleRepository: ICycleRepository,
    private validationService: ValidationService
  ) {}

  public async execute(
    id: string,
    startDate: string,
    endDate: string | null,
    notes: string | null = null,
    isExcludedFromPredictions?: boolean,
    confirmMerge?: boolean
  ): Promise<void> {
    const existing = await this.cycleRepository.getById(id);
    if (!existing) throw new Error(`Cycle entry ${id} not found.`);

    if (endDate !== null && isBefore(endDate, startDate)) {
      throw new ValidationError('End date cannot be before start date.', 'endDate');
    }

    const startRes = this.validationService.validateHistoricalDate(startDate);
    if (!startRes.isValid) {
      throw new ValidationError(startRes.error || 'Date cannot be in the future', 'startDate');
    }

    if (endDate !== null) {
      const endRes = this.validationService.validateHistoricalDate(endDate);
      if (!endRes.isValid) {
        throw new ValidationError(endRes.error || 'Date cannot be in the future', 'endDate');
      }
    }

    // Always fetch fresh state to prevent stale data
    const allCycles = await this.cycleRepository.getAll();
    
    // Find symmetric overlaps (gap <= 1 day)
    const overlapCandidates = allCycles.filter(c => {
      if (c.id === id) return false;
      
      const expandedCandidateStart = addDays(c.startDate, -1);
      const expandedCandidateEnd = c.endDate ? addDays(c.endDate, 1) : null;
      
      // TargetStart <= CandidateEndExpanded
      const startCondition = expandedCandidateEnd === null ? true : startDate <= expandedCandidateEnd;
      // TargetEnd >= CandidateStartExpanded
      const endCondition = endDate === null ? true : endDate >= expandedCandidateStart;
      
      return startCondition && endCondition;
    });

    if (overlapCandidates.length > 0) {
      if (!confirmMerge) {
        throw new MergeRequiredError(overlapCandidates.map(c => c.id));
      }
      
      // Perform Merge
      const allInvolved = [existing, ...overlapCandidates];
      
      // 1. Calculate boundaries
      const minStart = allInvolved.reduce((min, c) => (c.startDate < min ? c.startDate : min), startDate);
      // As requested: user's requested intent wins authoritatively.
      const finalEndDate = endDate;
      const durationDays = finalEndDate ? daysBetween(minStart, finalEndDate) + 1 : null;
      
      // 2. Consolidate notes
      // Sort chronologically by the cycle's original start date
      allInvolved.sort((a, b) => a.startDate < b.startDate ? -1 : 1);
      
      const rawNotesList = allInvolved.map(c => {
        if (c.id === id) return notes; // Use newly submitted notes for the edited cycle
        return c.notes;
      });
      
      const filteredNotes = rawNotesList
        .filter(n => n && n.trim().length > 0)
        .map(n => n!.trim());
      
      // Deduplicate
      const uniqueNotes = Array.from(new Set(filteredNotes));
      const finalNotes = uniqueNotes.length > 0 ? uniqueNotes.join('\n\n') : null;
      
      // 3. Consolidate isExcludedFromPredictions (Logical OR)
      const currentExcluded = isExcludedFromPredictions !== undefined ? isExcludedFromPredictions : existing.isExcludedFromPredictions;
      const finalExcluded = currentExcluded || overlapCandidates.some(c => c.isExcludedFromPredictions);
      
      await this.cycleRepository.mergeCycles(
        id, 
        overlapCandidates.map(c => c.id),
        {
          startDate: minStart,
          endDate: finalEndDate,
          durationDays,
          notes: finalNotes,
          isExcludedFromPredictions: finalExcluded
        }
      );
      
      return;
    }

    // Standard edit flow (no merge)
    const durationDays = endDate ? daysBetween(startDate, endDate) + 1 : null;
    const dataToUpdate: Partial<CycleEntry> = {
      startDate,
      endDate,
      durationDays,
      notes,
    };
    if (isExcludedFromPredictions !== undefined) {
      dataToUpdate.isExcludedFromPredictions = isExcludedFromPredictions;
    }

    await this.cycleRepository.update(id, dataToUpdate);
    await this.recalculateAllCycleLengths();
  }

  private async recalculateAllCycleLengths(): Promise<void> {
    const allCycles = await this.cycleRepository.getAll();
    // Sort oldest to newest
    allCycles.sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

    for (let i = 0; i < allCycles.length; i++) {
      const current = allCycles[i];
      let cycleLengthDays: number | null = null;
      
      if (i < allCycles.length - 1) {
        const next = allCycles[i + 1];
        if (current && next) {
          cycleLengthDays = daysBetween(current.startDate, next.startDate);
        }
      }

      if (current && current.cycleLengthDays !== cycleLengthDays) {
        await this.cycleRepository.update(current.id, { cycleLengthDays });
      }
    }
  }
}
