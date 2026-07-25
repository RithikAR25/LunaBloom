import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import renderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import InsightsScreen from '../../../app/(tabs)/insights';
import { useInsightsStore } from '../../../src/presentation/stores/useInsightsStore';
import { useContentStore } from '../../../src/presentation/stores/useContentStore';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
  SafeAreaProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: any) => cb(),
}));

describe.skip('InsightsScreen', () => {

  beforeEach(() => {
    useContentStore.setState({
      medicalConditions: [],
      symptomsData: {
        symptoms: [{ id: 'symp_1', label: 'Cramps', category: 'PHYSICAL' }],
        moods: [{ id: 'mood_1', label: 'Happy', icon: 'happy' }],
      },
      healthTips: null,
      isLoading: false,
      error: null,
      _repository: null,
      setRepository: jest.fn(),
      loadContent: jest.fn() as any,
    });
    
    useInsightsStore.setState({
      cycleStats: null,
      symptomTrends: null,
      moodTrends: null,
      wellbeingTrends: null,
      isLoading: false,
      error: null,
      loadInsights: jest.fn() as any,
    });
  });

  const findText = (root: renderer.ReactTestInstance, textOrRegex: string | RegExp) => {
    const texts = root.findAllByType(Text);
    return texts.some(t => {
      const children = Array.isArray(t.props.children) ? t.props.children.join('') : t.props.children;
      if (typeof children !== 'string') return false;
      if (typeof textOrRegex === 'string') return children.includes(textOrRegex);
      return textOrRegex.test(children);
    });
  };

  it('renders loading state initially', () => {
    useInsightsStore.setState({ isLoading: true });
    const tree = renderer.create(<InsightsScreen />);
    const activityIndicator = tree.root.findAllByProps({ accessibilityLabel: 'Loading insights...' });
    expect(activityIndicator.length).toBeGreaterThan(0);
  });

  it('renders no-cycles empty state when cycleStats is null', () => {
    const tree = renderer.create(<InsightsScreen />);
    expect(findText(tree.root, 'Not enough data yet')).toBe(true);
    expect(findText(tree.root, /Log your first period/i)).toBe(true);
  });

  it('renders insufficient-cycles empty state when trend is UNKNOWN on Overview tab', () => {
    useInsightsStore.setState({
      cycleStats: {
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        shortestCycle: 28,
        longestCycle: 28,
        cycleLengthTrend: 'UNKNOWN',
        regularityScore: null,
      }
    });

    const tree = renderer.create(<InsightsScreen />);
    expect(findText(tree.root, 'Building your profile')).toBe(true);
    expect(findText(tree.root, /We need at least 3 completed cycles/i)).toBe(true);
  });

  it('renders Overview stats when data is available', () => {
    useInsightsStore.setState({
      cycleStats: {
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        shortestCycle: 26,
        longestCycle: 30,
        cycleLengthTrend: 'STABLE',
        regularityScore: 90,
      }
    });

    const tree = renderer.create(<InsightsScreen />);
    expect(findText(tree.root, 'Averages')).toBe(true);
    expect(findText(tree.root, '28')).toBe(true);
    expect(findText(tree.root, 'STABLE')).toBe(true);
    expect(findText(tree.root, '90%')).toBe(true);
  });

  it('switches to Cycle tab and renders phase breakdown', () => {
    useInsightsStore.setState({
      cycleStats: {
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        shortestCycle: 26,
        longestCycle: 30,
        cycleLengthTrend: 'STABLE',
        regularityScore: 90,
      }
    });

    const tree = renderer.create(<InsightsScreen />);
    
    // Find the Cycle tab button and press it
    const cycleTab = tree.root.findAllByType(TouchableOpacity).find(node => {
      const textNode = node.findAllByType(Text)[0];
      return textNode && textNode.props.children === 'Cycle';
    });
    
    expect(cycleTab).toBeTruthy();
    cycleTab!.props.onPress();

    expect(findText(tree.root, 'Average Phase Breakdown')).toBe(true);
    expect(findText(tree.root, 'Based on your 28-day average cycle')).toBe(true);
    expect(findText(tree.root, 'Follicular')).toBe(true);
  });

  it('renders no-logs empty state on Symptoms tab when there are no logs', () => {
    useInsightsStore.setState({
      cycleStats: {
        averageCycleLength: 28,
        averagePeriodDuration: 5,
        shortestCycle: 26,
        longestCycle: 30,
        cycleLengthTrend: 'STABLE',
        regularityScore: 90,
      },
      symptomTrends: [],
      wellbeingTrends: []
    });

    const tree = renderer.create(<InsightsScreen />);
    
    // Switch to Symptoms tab
    const symTab = tree.root.findAllByType(TouchableOpacity).find(node => {
      const textNode = node.findAllByType(Text)[0];
      return textNode && textNode.props.children === 'Symptoms';
    });
    symTab!.props.onPress();

    expect(findText(tree.root, 'No daily logs found')).toBe(true);
    expect(findText(tree.root, /Start logging your daily symptoms/i)).toBe(true);
  });
});
