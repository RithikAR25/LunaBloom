import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useScaling, spacing, borderRadius, fontSize, lineHeight } from '@/design-system';
import { Text } from './Text';
import { Heading } from './Heading';
import { Button } from './Button';
import { Feather } from '@expo/vector-icons';

interface AlertModalProps {
  visible: boolean;
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
  dismissLabel?: string;
  onDismiss: () => void;
}

export function AlertModal({
  visible,
  type,
  title,
  message,
  dismissLabel = 'OK',
  onDismiss,
}: AlertModalProps) {
  const { colors } = useTheme();
  const { scale } = useScaling();

  const iconSize = scale(24);
  const containerSize = scale(48);
  const containerRadius = Math.round(containerSize / 2);

  let iconName: React.ComponentProps<typeof Feather>['name'] = 'info';
  let color = colors.brand.primary;
  let bgColor = `${colors.brand.primary}20`;
  let buttonVariant: 'primary' | 'secondary' | 'danger' = 'secondary';

  if (type === 'error') {
    iconName = 'alert-circle';
    color = colors.semantic.error;
    bgColor = `${colors.semantic.error}20`;
    buttonVariant = 'danger';
  } else if (type === 'success') {
    iconName = 'check-circle';
    color = colors.semantic.success;
    bgColor = `${colors.semantic.success}20`;
    buttonVariant = 'primary';
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { backgroundColor: colors.background, shadowColor: colors.shadow }]}>
          
          <View style={styles.header}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: bgColor, width: containerSize, height: containerSize, borderRadius: containerRadius }
            ]}>
              <Feather 
                name={iconName} 
                size={iconSize} 
                color={color} 
              />
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={onDismiss} style={styles.closeButton}>
              <Feather name="x" size={iconSize} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Heading level="h3" style={[styles.title, { color: colors.text.primary }]}>
            {title}
          </Heading>
          
          <Text variant="body" style={[styles.message, { color: colors.text.secondary }]}>
            {message}
          </Text>

          <View style={styles.footer}>
            <Button
              variant={buttonVariant}
              label={dismissLabel}
              onPress={onDismiss}
              fullWidth
            />
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
    width: '100%',
  }
});
