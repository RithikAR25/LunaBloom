import { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAIAssistantStore } from '../src/presentation/stores/useAIAssistantStore';
import { useTheme } from '../src/presentation/hooks/useTheme';
import { Text } from '../src/presentation/components/ui/Text';
import { ChatMessage } from '../src/presentation/components/ai/ChatMessage';
import { ChatInput } from '../src/presentation/components/ai/ChatInput';
import { spacing, fontFamily } from '../src/design-system';
import { AIToolSystem } from '../src/application/services/AIToolSystem';
import { SQLiteCycleRepository } from '../src/infrastructure/repositories/SQLiteCycleRepository';
import { SQLiteDailyLogRepository } from '../src/infrastructure/repositories/SQLiteDailyLogRepository';
import { SQLiteUserProfileRepository } from '../src/infrastructure/repositories/SQLiteUserProfileRepository';

const PHASE_SUGGESTIONS: Record<string, string[]> = {
  MENSTRUAL: [
    "What happens during my period?",
    "What symptoms have I logged recently?",
    "How can I take care of myself during my period?"
  ],
  FOLLICULAR: [
    "What happens during the follicular phase?",
    "What does my cycle history look like?",
    "How is my next period predicted?"
  ],
  OVULATORY: [
    "What happens around ovulation?",
    "What does my fertility window mean?",
    "How does LunaBloom estimate my fertile window?"
  ],
  LUTEAL: [
    "What happens during the luteal phase?",
    "What symptoms have I logged recently?",
    "Why does my energy or mood sometimes change before my period?"
  ],
  DEFAULT: [
    "When is my next period?",
    "What does my cycle history look like?",
    "What happens during my period?"
  ]
};

export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const {
    modelStatus,
    messages,
    isGenerating,
    error,
    toolSystem,
    checkModelStatus,
    loadModel,
    sendMessage,
    setToolSystem,
    clearError,
    currentPhaseForSuggestions,
    fetchCurrentPhaseForSuggestions
  } = useAIAssistantStore();

  useEffect(() => {
    checkModelStatus();
  }, []);

  useEffect(() => {
    if (!toolSystem) {
      const ts = new AIToolSystem(
        new SQLiteCycleRepository(),
        new SQLiteDailyLogRepository(),
        new SQLiteUserProfileRepository()
      );
      setToolSystem(ts);
    }
  }, [toolSystem, setToolSystem]);

  useEffect(() => {
    if (modelStatus === 'DOWNLOADED') {
      loadModel();
    } else if (modelStatus === 'READY') {
      fetchCurrentPhaseForSuggestions();
    }
  }, [modelStatus, loadModel, fetchCurrentPhaseForSuggestions]);

  // Combine messages + thinking message
  const displayMessages = [...messages];
  if (isGenerating) {
    displayMessages.push({
      id: 'thinking',
      role: 'assistant',
      content: '🌙 Luna is thinking...',
      timestamp: new Date().toISOString()
    });
  }

  const renderContent = () => {
    if (modelStatus === 'NOT_DOWNLOADED' || modelStatus === 'DOWNLOADING' || modelStatus === 'VERIFYING') {
      return (
        <View style={styles.centerContainer}>
          <Feather name="download-cloud" size={48} color={colors.text.tertiary} />
          <Text variant="body" weight="bold" style={[styles.statusTitle, { color: colors.text.primary, fontSize: 24 }]}>
            {modelStatus === 'NOT_DOWNLOADED' ? 'AI Not Installed' : 'AI Downloading'}
          </Text>
          <Text variant="body" style={[styles.statusText, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
            LunaBloom's private, on-device AI model must be downloaded before use. 
            It runs completely offline to protect your data.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.brand.primary }]}
            onPress={() => router.push('/settings/ai')}
          >
            <Text variant="label" weight="medium" style={{ color: colors.text.inverse }}>Manage AI Storage</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (modelStatus === 'LOADING') {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text variant="body" weight="medium" style={[styles.statusTitle, { color: colors.text.primary }]}>Waking up LunaBloom AI...</Text>
          <Text variant="caption" style={{ color: colors.text.tertiary, marginTop: spacing.sm }}>
            Loading local model into memory. This runs 100% offline.
          </Text>
        </View>
      );
    }

    if (modelStatus === 'ERROR' || error) {
      return (
        <View style={styles.centerContainer}>
          <Feather name="alert-triangle" size={48} color={colors.semantic.error} />
          <Text variant="body" weight="bold" style={[styles.statusTitle, { color: colors.text.primary, fontSize: 24 }]}>AI Error</Text>
          <Text variant="body" style={[styles.statusText, { color: colors.text.secondary }]}>
            {error || 'Failed to initialize the AI model.'}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.brand.primary }]}
            onPress={() => {
              clearError();
              if (modelStatus === 'ERROR') loadModel();
            }}
          >
            <Text variant="label" weight="medium" style={{ color: colors.text.inverse }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessage 
              message={item} 
              isStreaming={item.id === 'thinking' && isGenerating} 
            />
          )}
          ListEmptyComponent={() => {
             const phaseKey = currentPhaseForSuggestions ? currentPhaseForSuggestions.toUpperCase() : 'DEFAULT';
             const suggestions = PHASE_SUGGESTIONS[phaseKey] || PHASE_SUGGESTIONS['DEFAULT'] || [];
             
             return (
               <View style={styles.emptyState}>
                 <View style={[styles.welcomeAvatar, { backgroundColor: `${colors.brand.primary}20` }]}>
                   <Feather name="message-circle" size={32} color={colors.brand.primary} />
                 </View>
                 <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 18, marginTop: spacing.md }}>
                   Hi, I'm Luna ✨
                 </Text>
                 <Text variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 }}>
                   Ask me anything about your cycle, symptoms, or women's health. I have access to your app data and work completely offline.
                 </Text>
                 <View style={styles.suggestedQuestions}>
                   {suggestions.map((q) => (
                     <TouchableOpacity
                       key={q}
                       style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}
                       onPress={() => {
                         if (modelStatus === 'READY' && !isGenerating) sendMessage(q);
                       }}
                     >
                       <Text variant="caption" style={{ color: colors.text.secondary }}>{q}</Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>
             );
          }}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <ChatInput 
          onSend={(text) => {
            if (modelStatus === 'READY' && !isGenerating) {
              sendMessage(text);
            }
          }}
          disabled={isGenerating || modelStatus !== 'READY'} 
        />
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text variant="body" weight="bold" style={{ color: colors.text.primary, fontFamily: fontFamily.medium, fontSize: 18 }}>
            LunaBloom AI
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        {renderContent()}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  statusTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statusText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  welcomeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestedQuestions: {
    marginTop: spacing.xl,
    width: '100%',
    gap: spacing.sm,
  },
  suggestionChip: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  }
});
