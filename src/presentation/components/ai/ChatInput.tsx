import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { spacing, borderRadius, fontFamily, fontSize } from '../../../design-system';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Ask LunaBloom...' }: ChatInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
      <View style={[
        styles.inputWrapper, 
        { 
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.borderSubtle 
        }
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text.primary }]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          multiline
          maxLength={500}
          editable={!disabled}
          autoCapitalize="sentences"
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { backgroundColor: text.trim() && !disabled ? colors.brand.primary : colors.surfaceNeutral }
          ]} 
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Feather name="arrow-up" size={20} color={text.trim() && !disabled ? colors.text.inverse : colors.text.disabled} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderTopWidth: 1,
    paddingBottom: spacing.lg, // Extra padding for safe area
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyMd,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    maxHeight: 120,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  }
});
