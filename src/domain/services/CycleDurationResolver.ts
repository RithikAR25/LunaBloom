import { addDays, todayISO } from '../../utils/dateUtils';

export class CycleDurationResolver {
  public static resolveEndDate(
    startDate: string,
    defaultDurationDays: number
  ): string | null {
    const today = todayISO();
    const naturalEnd = addDays(startDate, defaultDurationDays - 1);

    if (naturalEnd >= today) {
      return null; // genuinely active
    } else {
      return naturalEnd; // naturally concluded historical period
    }
  }
}
