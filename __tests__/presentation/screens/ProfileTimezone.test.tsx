import { render, screen } from '@testing-library/react-native';
// @ts-ignore
import ProfileSettingsScreen from '../../../../app/settings/profile';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../../../src/presentation/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      brand: { primary: '#000' },
      text: { secondary: '#333', tertiary: '#555' },
      semantic: { error: 'red' },
      background: { primary: '#fff' }
    },
  }),
}));

jest.mock('../../../../src/presentation/stores/useProfileStore', () => ({
  useProfileStore: (selector: any) => {
    const mockState = {
      profile: { preferredName: 'Test', dateOfBirth: '2024-05-01', heightCm: 160, weightKg: 60 },
      updateProfile: jest.fn(),
      isLoading: false,
    };
    return selector(mockState);
  },
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return function MockDateTimePicker(props: any) {
    return <View testID="datetime-picker" test-value={props.value.toISOString()} />;
  };
});

describe('ProfileSettingsScreen Timezone Display', () => {
  const originalEnvTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalEnvTz;
  });

  const runTestInTimezone = async (tz: string) => {
    process.env.TZ = tz;
    
    await render(<ProfileSettingsScreen />);
    
    // We mocked the profile store to have '2024-05-01'.
    // The DateTimePicker should receive a Date object representing '2024-05-01T00:00:00' in local time.
    // In UTC, its ISO string would shift depending on timezone, but we can verify the local day is 1 and month is 4 (May).
    // Or we just check that it does not evaluate to April 30.
    const picker = screen.getByTestId('datetime-picker');
    const valuePropStr = picker.props['test-value'];
    const dateObj = new Date(valuePropStr);
    
    expect(dateObj.getFullYear()).toBe(2024);
    expect(dateObj.getMonth()).toBe(4); // May
    expect(dateObj.getDate()).toBe(1); // 1st
  };

  it('passes the correct local date to DateTimePicker in a negative timezone offset (UTC-5)', async () => {
    await runTestInTimezone('America/New_York');
  });

  it('passes the correct local date to DateTimePicker in a positive timezone offset (UTC+5:30)', async () => {
    await runTestInTimezone('Asia/Kolkata');
  });
});
