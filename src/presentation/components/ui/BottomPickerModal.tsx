import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '@/presentation/hooks/useTheme';
import { spacing, fontSize, fontFamily, borderRadius } from '@/design-system';

interface BottomPickerModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

export function BottomPickerModal({ visible, onCancel, onConfirm, children }: BottomPickerModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.text.secondary }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.brand.primary, fontFamily: fontFamily.semiBold }]}>Confirm</Text>
            </Pressable>
          </View>
          
          <View style={styles.contentContainer}>
            {children}
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
    paddingBottom: spacing.xl,
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
  contentContainer: {
    position: 'relative',
    width: '100%',
  },
});
