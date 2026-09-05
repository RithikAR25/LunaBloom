import { render, screen } from '@testing-library/react-native';
import { CycleHistoryChart } from '../../../../src/presentation/components/dashboard/CycleHistoryChart';
import type { CycleEntry } from '../../../../src/domain/models/Cycle';

// Mock dependencies
jest.mock('@/presentation/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      brand: { primary: '#000' },
      text: { secondary: '#333' },
    },
  }),
}));

jest.mock('@/design-system', () => ({
  spacing: { 1: 4, 4: 16, 6: 24 },
  borderRadius: { lg: 12 },
  useScaling: () => ({
    scale: (v: number) => v,
    verticalScale: (v: number) => v,
  }),
}));

jest.mock('../../../../src/presentation/components/ui/Text', () => ({
  Text: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../../../src/presentation/components/ui/Heading', () => ({
  Heading: ({ children }: any) => <>{children}</>,
}));

describe('CycleHistoryChart Timezone Display', () => {
  const originalEnvTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalEnvTz;
  });

  const runTestInTimezone = async (tz: string, expectedMonth: string) => {
    process.env.TZ = tz;
    
    // Create a cycle that starts on May 1st
    const cycles = [
      {
        id: '1',
        startDate: '2024-05-01',
      }
    ] as CycleEntry[];

    await render(<CycleHistoryChart cycles={cycles} />);
    
    // We expect the short month to be "May" in English locale
    expect(screen.getByText(expectedMonth)).toBeTruthy();
  };

  it('displays the correct month in a negative timezone offset (UTC-5)', async () => {
    await runTestInTimezone('America/New_York', 'May');
  });

  it('displays the correct month in a positive timezone offset (UTC+5:30)', async () => {
    await runTestInTimezone('Asia/Kolkata', 'May');
  });
});
