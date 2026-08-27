import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomPickerModal } from './BottomPickerModal';
import { WheelPicker } from './WheelPicker';
import { spacing } from '@/design-system';

interface TimePickerModalProps {
  visible: boolean;
  value: string; // "HH:mm"
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AMPM = ['AM', 'PM'];

// Helper to parse "HH:mm" into wheel indices
function parseTimeToIndices(timeStr: string) {
  const parts = timeStr.split(':').map(Number);
  let hh = parts[0] ?? 21;
  let mm = parts[1] ?? 0;
  
  if (isNaN(hh)) hh = 21;
  if (isNaN(mm)) mm = 0;
  
  const isPm = hh >= 12;
  
  // Convert 0-23 to 1-12
  let displayHour = hh % 12;
  if (displayHour === 0) displayHour = 12;

  return {
    hourIndex: displayHour - 1, // 1-12 maps to index 0-11
    minuteIndex: Math.max(0, Math.min(59, mm)),
    ampmIndex: isPm ? 1 : 0
  };
}

export function TimePickerModal({ visible, value, onConfirm, onCancel }: TimePickerModalProps) {
  const [draftHourIndex, setDraftHourIndex] = useState(0);
  const [draftMinuteIndex, setDraftMinuteIndex] = useState(0);
  const [draftAmpmIndex, setDraftAmpmIndex] = useState(0);

  // Reset wheels to saved value whenever modal becomes visible
  useEffect(() => {
    if (visible) {
      const { hourIndex, minuteIndex, ampmIndex } = parseTimeToIndices(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftHourIndex(hourIndex);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftMinuteIndex(minuteIndex);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftAmpmIndex(ampmIndex);
    }
  }, [visible, value]);

  const handleConfirm = () => {
    let hh = draftHourIndex + 1; // index 0-11 -> 1-12
    const mm = draftMinuteIndex;
    const isPm = draftAmpmIndex === 1;

    // Convert back to 24-hour format
    if (isPm && hh < 12) {
      hh += 12;
    } else if (!isPm && hh === 12) {
      hh = 0;
    }

    const hhStr = hh.toString().padStart(2, '0');
    const mmStr = mm.toString().padStart(2, '0');
    
    onConfirm(`${hhStr}:${mmStr}`);
  };

  return (
    <BottomPickerModal
      visible={visible}
      onCancel={onCancel}
      onConfirm={handleConfirm}
    >
      <View style={styles.wheelContainer}>
        <WheelPicker
          items={HOURS}
          selectedIndex={draftHourIndex}
          onChange={setDraftHourIndex}
          itemToString={(h) => h.toString()}
        />
        <WheelPicker
          items={MINUTES}
          selectedIndex={draftMinuteIndex}
          onChange={setDraftMinuteIndex}
          itemToString={(m) => m.toString().padStart(2, '0')}
        />
        <WheelPicker
          items={AMPM}
          selectedIndex={draftAmpmIndex}
          onChange={setDraftAmpmIndex}
        />
      </View>
    </BottomPickerModal>
  );
}

const styles = StyleSheet.create({
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
});
