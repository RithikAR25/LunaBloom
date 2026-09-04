import { render, fireEvent, screen } from '@testing-library/react-native';
import { EditCycleModal } from '../EditCycleModal';

// Mock dependencies
jest.mock('@/presentation/stores/useCycleStore', () => ({
  useCycleStore: {
    getState: jest.fn(() => ({ cycles: [] }))
  }
}));
jest.mock('@/presentation/stores/useProfileStore', () => ({
  useProfileStore: {
    getState: jest.fn(() => ({ profile: { avgCycleLength: 28 } }))
  }
}));

// Mock DateRangePickerGrid to expose props and trigger onSelectDate easily
let gridOnSelectDate: (dateStr: string) => void;
let gridOnDragBoundary: (draggedBoundary: 'start' | 'end', newDateStr: string) => void;
jest.mock('../DateRangePickerGrid', () => {
  const { View, Text } = require('react-native');
  return {
    DateRangePickerGrid: ({ onSelectDate, onDragBoundary, startDate, endDate }: any) => {
      gridOnSelectDate = onSelectDate;
      gridOnDragBoundary = onDragBoundary;
      return (
        <View testID="mock-grid">
          <Text testID="grid-start">{startDate}</Text>
          <Text testID="grid-end">{endDate}</Text>
        </View>
      );
    }
  };
});

jest.mock('@/presentation/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFF',
      surface: '#EEE',
      text: { primary: '#000', secondary: '#555' },
      brand: { primary: '#RED', secondaryContainer: '#PINK' },
      border: '#CCC',
      semantic: { error: '#ERR' }
    }
  })
}));

const mockCycle = {
  id: 'cycle-1',
  startDate: '2023-10-01',
  endDate: '2023-10-05',
  notes: null,
  isExcludedFromPredictions: false
} as any;

const mockCycleOneDay = {
  id: 'cycle-2',
  startDate: '2023-10-01',
  endDate: '2023-10-01',
  notes: null,
  isExcludedFromPredictions: false
} as any;

describe('EditCycleModal smart boundary tab switching', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('FROM + existing End -> switches to TO, dates unchanged', () => {
    render(
      <EditCycleModal 
        visible={true} 
        cycle={mockCycle} 
        onClose={onClose} 
        onSave={onSave} 
        onDelete={onDelete} 
      />
    );
    
    // Modal opens on 'From' tab by default
    // Tap the existing End Date ('2023-10-05')
    gridOnSelectDate('2023-10-05');
    
    // Dates should be unchanged
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-01');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-05');

    // To verify we switched to 'To', we pick a new valid date (e.g., '2023-10-06')
    // and it should update the end date.
    gridOnSelectDate('2023-10-06');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-06');
    // Start date should remain the same
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-01');
  });

  it('TO + existing Start -> switches to FROM, dates unchanged', () => {
    render(
      <EditCycleModal 
        visible={true} 
        cycle={mockCycle} 
        onClose={onClose} 
        onSave={onSave} 
        onDelete={onDelete} 
      />
    );
    
    // Manually switch to 'To' tab by pressing it
    fireEvent.press(screen.getByText('TO'));
    
    // Tap the existing Start Date ('2023-10-01')
    gridOnSelectDate('2023-10-01');
    
    // Dates should be unchanged
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-01');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-05');

    // Verify it switched to 'From' by picking a new valid date ('2023-09-30')
    gridOnSelectDate('2023-09-30');
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-30');
  });

  it('FROM + existing Start -> remains FROM, dates unchanged', () => {
    render(
      <EditCycleModal 
        visible={true} 
        cycle={mockCycle} 
        onClose={onClose} 
        onSave={onSave} 
        onDelete={onDelete} 
      />
    );
    
    // Modal opens on 'From' tab
    // Tap the existing Start Date
    gridOnSelectDate('2023-10-01');
    
    // Dates should be unchanged
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-01');
    
    // Verify it remains on 'From' by picking a new valid date
    gridOnSelectDate('2023-09-30');
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-30');
  });

  it('TO + existing End -> remains TO, dates unchanged', () => {
    render(
      <EditCycleModal 
        visible={true} 
        cycle={mockCycle} 
        onClose={onClose} 
        onSave={onSave} 
        onDelete={onDelete} 
      />
    );
    
    fireEvent.press(screen.getByText('TO'));
    
    // Tap the existing End Date
    gridOnSelectDate('2023-10-05');
    
    // Dates should be unchanged
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-05');
    
    // Verify it remains on 'To' by picking a new valid date
    gridOnSelectDate('2023-10-06');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-06');
  });

  it('Start === End -> preserves current tab and dates', () => {
    render(
      <EditCycleModal 
        visible={true} 
        cycle={mockCycleOneDay} 
        onClose={onClose} 
        onSave={onSave} 
        onDelete={onDelete} 
      />
    );
    
    // Currently on 'From' tab
    gridOnSelectDate('2023-10-01'); // Tap the boundary
    
    // Dates unchanged
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-01');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-01');

    // Should remain on 'From' tab
    gridOnSelectDate('2023-09-30'); // new start date
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-30');
    
    // Switch to 'To' tab manually
    fireEvent.press(screen.getByText('TO'));
    // we need a re-render here? The test might fail if the state change hasn't settled, but fireEvent should be sync.
    // wait, the cycle is still mockCycleOneDay, but the local state `startDate` changed to '2023-09-30'.
    // Let's tap the current end boundary ('2023-10-01')
    gridOnSelectDate('2023-10-01'); 
    
    // Should remain on 'To' tab
    gridOnSelectDate('2023-10-05'); // new end date
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-05');
  });

  it('Non-boundary dates continue through existing selection logic', () => {
    render(
      <EditCycleModal 
        visible={true} 
        cycle={mockCycle} 
        onClose={onClose} 
        onSave={onSave} 
        onDelete={onDelete} 
      />
    );
    
    // On 'From' tab, pick a completely new date
    gridOnSelectDate('2023-09-28');
    
    // It should update the start date
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-28');
    // And standard behavior: it should auto-advance to the 'To' tab!
    // So next selection should update the end date.
    gridOnSelectDate('2023-10-10');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-10');
  });
});

describe('EditCycleModal drag-to-stretch interactions', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Drag Start within range -> Start updates continuously', () => {
    render(
      <EditCycleModal 
        visible={true} cycle={mockCycle} onClose={onClose} onSave={onSave} onDelete={onDelete} 
      />
    );
    
    // Drag start boundary backwards
    gridOnDragBoundary('start', '2023-09-30');
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-30');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-05');
  });

  it('Drag End within range -> End updates continuously', () => {
    render(
      <EditCycleModal 
        visible={true} cycle={mockCycle} onClose={onClose} onSave={onSave} onDelete={onDelete} 
      />
    );
    
    // Drag end boundary forward
    gridOnDragBoundary('end', '2023-10-06');
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-01');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-06');
  });

  it('Drag Start past End -> range flips correctly and active tab becomes TO', () => {
    render(
      <EditCycleModal 
        visible={true} cycle={mockCycle} onClose={onClose} onSave={onSave} onDelete={onDelete} 
      />
    );
    
    // Original: Start '2023-10-01', End '2023-10-05'
    // Drag Start forward past End
    gridOnDragBoundary('start', '2023-10-06');
    
    // The old end ('2023-10-05') becomes the new start
    // The dragged date ('2023-10-06') becomes the new end
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-05');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-06');

    // To prove it flipped active tab to 'To', subsequent normal selection updates 'To'
    gridOnSelectDate('2023-10-07');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-07');
  });

  it('Drag End before Start -> symmetric flip and active tab becomes FROM', () => {
    render(
      <EditCycleModal 
        visible={true} cycle={mockCycle} onClose={onClose} onSave={onSave} onDelete={onDelete} 
      />
    );
    
    // Original: Start '2023-10-01', End '2023-10-05'
    // Drag End backward before Start
    gridOnDragBoundary('end', '2023-09-30');
    
    // The dragged date ('2023-09-30') becomes the new start
    // The old start ('2023-10-01') becomes the new end
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-30');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-01');

    // To prove it flipped active tab to 'From', subsequent normal selection updates 'From'
    gridOnSelectDate('2023-09-29');
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-09-29');
  });

  it('Continue moving after a flip -> no jitter/incorrect boundary ownership', () => {
    render(
      <EditCycleModal 
        visible={true} cycle={mockCycle} onClose={onClose} onSave={onSave} onDelete={onDelete} 
      />
    );
    
    // 1. Drag Start past End
    gridOnDragBoundary('start', '2023-10-06');
    // Result: Start=05, End=06, draggingBoundaryRef=end
    
    // 2. The component fires onDragBoundary('start', '2023-10-07') because the initial gesture touch was on 'start'.
    gridOnDragBoundary('start', '2023-10-07');
    
    // Result: Since draggingBoundaryRef is 'end', it should correctly update the End date, NOT Start!
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-05');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-07');

    // 3. What if they drag it all the way back before 05?
    gridOnDragBoundary('start', '2023-10-04');
    
    // It flips back! 04 becomes Start, 05 becomes End, draggingBoundaryRef=start
    expect(screen.getByTestId('grid-start').props.children).toBe('2023-10-04');
    expect(screen.getByTestId('grid-end').props.children).toBe('2023-10-05');
  });
});
