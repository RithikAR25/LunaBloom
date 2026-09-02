export const EMPTY_CYCLE_DATA = [];
export const EMPTY_LOG_DATA = [];
export const EMPTY_PROFILE_DATA = null;

export const NORMAL_CYCLE_DATA = [
  { id: '1', startDate: '2026-05-24', endDate: '2026-05-29', cycleLengthDays: 66, durationDays: 5 },
  { id: '2', startDate: '2026-07-29', endDate: '2026-08-02', cycleLengthDays: 66, durationDays: 5 }
];

export const NORMAL_LOG_DATA = [
  { id: '1', date: '2026-08-15', symptoms: ['cramps', 'fatigue'], flow: 'medium', mood: 'tired' },
  { id: '2', date: '2026-08-16', symptoms: ['headache'], flow: 'light', mood: 'calm' }
];

export const NORMAL_PROFILE_DATA = {
  name: 'Luna User',
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  primaryGoal: 'track',
  trackingMode: 'Standard'
};

export const NORMAL_PREDICTION_DATA = {
  nextPeriodDays: 12,
  confidence: 'high',
  ovulationDays: -2
};
