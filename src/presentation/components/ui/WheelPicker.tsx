import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { fontSize, fontFamily } from '@/design-system';

export const ITEM_HEIGHT = 48;
export const VISIBLE_ITEMS = 5;
export const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PAD_HEIGHT = (LIST_HEIGHT - ITEM_HEIGHT) / 2;

interface WheelPickerProps<T> {
  items: T[];
  selectedIndex: number;
  onChange: (index: number) => void;
  itemToString?: (item: T) => string;
}

export function WheelPicker<T>({
  items,
  selectedIndex,
  onChange,
  itemToString = (item) => String(item)
}: WheelPickerProps<T>) {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [internalIndex, setInternalIndex] = useState(selectedIndex);

  // Sync internal state if selectedIndex changes from above
  useEffect(() => {
    if (selectedIndex !== internalIndex) {
      setInternalIndex(selectedIndex);
      // Wait a tick for layout if needed, though FlatList with initialScrollIndex usually handles mounting
      flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
    }
  }, [selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, newIndex));
    
    if (clampedIndex !== internalIndex) {
      setInternalIndex(clampedIndex);
      onChange(clampedIndex);
    }
  };

  const handleItemPress = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    if (clampedIndex !== internalIndex) {
      setInternalIndex(clampedIndex);
      onChange(clampedIndex);
      flatListRef.current?.scrollToIndex({ index: clampedIndex, animated: true });
    }
  };

  return (
    <View style={[styles.container, { height: LIST_HEIGHT }]}>
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // initialScrollIndex relies on getItemLayout to be completely synchronous and accurate
        initialScrollIndex={selectedIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: PAD_HEIGHT,
        }}
        renderItem={({ item, index }) => {
          const isSelected = index === internalIndex;
          return (
            <Pressable 
              onPress={() => handleItemPress(index)}
              style={[styles.itemContainer, { height: ITEM_HEIGHT }]}
            >
              <Text 
                style={[
                  styles.itemText, 
                  { 
                    color: isSelected ? colors.brand.primary : colors.text.secondary,
                    fontFamily: isSelected ? fontFamily.semiBold : fontFamily.regular,
                    fontSize: isSelected ? fontSize.headlineSm : fontSize.bodyLg,
                  }
                ]}
              >
                {itemToString(item)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
