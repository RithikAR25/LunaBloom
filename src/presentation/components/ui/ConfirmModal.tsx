import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, fontSize, lineHeight } from '@/design-system';
import { Text } from './Text';
import { Heading } from './Heading';
import { Button } from './Button';
import { Feather } from '@expo/vector-icons';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.background, shadowColor: colors.shadow }]}>
          
          <View style={styles.header}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: isDestructive ? `${colors.semantic.error}20` : `${colors.brand.primary}20` }
            ]}>
              <Feather 
                name={isDestructive ? 'alert-triangle' : 'info'} 
                size={24} 
                color={isDestructive ? colors.semantic.error : colors.brand.primary} 
              />
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.closeButton}>
              <Feather name="x" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Heading level="h3" style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Heading>
          
          <Text variant="body" style={[styles.message, { color: colors.text.secondary }]}>
            {message}
          </Text>

          {children && (
            <View style={{ marginBottom: spacing[6] }}>
              {children}
            </View>
          )}

          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                label={cancelLabel}
                onPress={onCancel}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                variant={isDestructive ? 'danger' : 'primary'}
                label={confirmLabel}
                onPress={onConfirm}
              />
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    elevation: 5,
    // shadowColor applied dynamically
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: spacing[1],
  },
  title: {
    marginBottom: spacing[2],
  },
  message: {
    marginBottom: spacing[8],
    lineHeight: fontSize.bodyMd * lineHeight.relaxed,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
  }
});
