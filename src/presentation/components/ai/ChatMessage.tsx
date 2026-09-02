import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../ui/Text';
import { spacing, borderRadius } from '../../../design-system';
import type { Message } from '../../stores/useAIAssistantStore';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const { colors } = useTheme();

  const isUser = message.role === 'user';

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer,
    ]}>
      <View style={[
        styles.bubble,
        isUser 
          ? { backgroundColor: colors.brand.primary, borderBottomRightRadius: 4 } 
          : { backgroundColor: colors.surfaceElevated, borderBottomLeftRadius: 4 }
      ]}>
        <Text 
          variant="body" 
          style={{ color: isUser ? colors.text.inverse : colors.text.primary }}
        >
          {message.content}
        </Text>
        {isStreaming && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.brand.primary} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    flexDirection: 'row',
    width: '100%',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  loadingIndicator: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  }
});
