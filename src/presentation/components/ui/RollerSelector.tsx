import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily, borderRadius } from '@/design-system';

interface RollerSelectorProps<T> {
  visible: boolean;
  items: T[];
  selectedIndex: number;
  onConfirm: (item: T, index: number) => void;
  onCancel: () => void;
  itemToString?: (item: T) => string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export function RollerSelector<T>({
  visible,
  items,
  selectedIndex,
  onConfirm,
  onCancel,
  itemToString = (item) => String(item)
}: RollerSelectorProps<T>) {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  
  // Temporary selection state for scrolling
  const [tempIndex, setTempIndex] = useState(selectedIndex);

  // Sync tempIndex when modal opens
  useEffect(() => {
    if (visible) {
      setTempIndex(selectedIndex);
    }
  }, [visible, selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    // Calculate the index that is currently at the center
    const newIndex = Math.round(offsetY / ITEM_HEIGHT);
    if (newIndex >= 0 && newIndex < items.length && newIndex !== tempIndex) {
      setTempIndex(newIndex);
    }
  };

  const handleConfirm = () => {
    onConfirm(items[tempIndex] as T, tempIndex);
  };

  const padHeight = (LIST_HEIGHT - ITEM_HEIGHT) / 2;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header Controls */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.text.secondary }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.brand.primary, fontFamily: fontFamily.semiBold }]}>Confirm</Text>
            </Pressable>
          </View>

          {/* Roller Area */}
          <View style={[styles.rollerContainer, { height: LIST_HEIGHT }]}>
            {/* Center Selection Highlight */}
            <View 
              style={[
                styles.selectionHighlight, 
                { 
                  backgroundColor: colors.surfaceElevated,
                  height: ITEM_HEIGHT,
                  top: padHeight
                }
              ]} 
              pointerEvents="none"
            />
            
            <FlatList
              ref={flatListRef}
              data={items}
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              snapToAlignment="center"
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              initialScrollIndex={selectedIndex}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              contentContainerStyle={{
                paddingVertical: padHeight,
              }}
              renderItem={({ item, index }) => {
                const isSelected = index === tempIndex;
                return (
                  <View style={[styles.itemContainer, { height: ITEM_HEIGHT }]}>
                    <Text 
                      style={[
                        styles.itemText, 
                        { 
                          color: isSelected ? colors.brand.primary : colors.text.secondary,
                          fontFamily: isSelected ? fontFamily.semiBold : fontFamily.regular,
                          fontSize: isSelected ? fontSize.titleMd : fontSize.bodyLg,
                        }
                      ]}
                    >
                      {itemToString(item)}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerButtonText: {
    fontSize: fontSize.bodyLg,
  },
  rollerContainer: {
    position: 'relative',
    width: '100%',
  },
  selectionHighlight: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    borderRadius: borderRadius.md,
    opacity: 0.5,
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
