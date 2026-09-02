import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing } from '@/design-system';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { AIEvalRunner, type EvalResult } from '../../src/application/services/AIEvalRunner';
import * as Clipboard from 'expo-clipboard';

export default function EvalScreen() {
  const { colors } = useTheme();
  
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EvalResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(true);

  const runEval = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    
    let questionsToRun: string[] | undefined = undefined;

    if (isCustomMode) {
      questionsToRun = customInput
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      if (questionsToRun.length === 0) {
        Alert.alert('Error', 'Please enter at least one custom question.');
        setIsRunning(false);
        return;
      }
    }

    try {
      const runner = new AIEvalRunner();
      const finalResults = await runner.runSuite(questionsToRun, (prog, result) => {
        setProgress(prog);
        setCurrentTest(result.query);
        setResults(prev => [...prev, result]);
      });
      setResults(finalResults);
      Alert.alert('Evaluation Complete', `Successfully ran ${finalResults.length} tests.`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : String(err));
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const generateCopyableText = () => {
    return results.map((r, i) => {
      return `[${i + 1}]\nQuestion: ${r.query}\nResponse Source: ${r.source}\nAnswer: ${r.response}\nTool Time: ${r.metrics.toolExecutionTimeMs}ms\nLLM Time: ${r.metrics.llmGenerationTimeMs}ms\nTotal Time: ${r.metrics.totalTimeMs}ms\n-------------------`;
    }).join('\n\n');
  };

  const copyToClipboard = async () => {
    const text = generateCopyableText();
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Results copied to clipboard!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Heading level="h2" style={{ color: colors.text.primary }}>AI Evaluation</Heading>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button 
                label="Custom Qs" 
                variant={isCustomMode ? 'primary' : 'secondary'}
                onPress={() => setIsCustomMode(true)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button 
                label="Standard Suite" 
                variant={!isCustomMode ? 'primary' : 'secondary'}
                onPress={() => setIsCustomMode(false)}
              />
            </View>
          </View>

          {isCustomMode ? (
            <>
              <Text variant="body" weight="bold" style={{ color: colors.text.primary, marginBottom: spacing.xs }}>
                Custom Questions (Real Data)
              </Text>
              <Text variant="caption" style={{ color: colors.text.secondary, marginBottom: spacing.sm }}>
                Enter questions (one per line). The AI will use your actual cycle and log data.
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text.primary, backgroundColor: colors.surfaceElevated }]}
                multiline
                numberOfLines={8}
                placeholder="When is my next period?\nWhat did I log yesterday?"
                placeholderTextColor={colors.text.secondary}
                value={customInput}
                onChangeText={setCustomInput}
                editable={!isRunning}
                textAlignVertical="top"
              />
            </>
          ) : (
            <Text variant="body" style={{ color: colors.text.secondary, marginBottom: spacing.md }}>
              This runs the standard regression dataset against the local Gemma model using Mock Repositories.
            </Text>
          )}

          <View style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
            <Button 
              label={isRunning ? `Running... (${Math.round(progress * 100)}%)` : 'Start Evaluation'} 
              onPress={runEval}
              disabled={isRunning}
            />
          </View>

          {isRunning && (
            <View style={{ marginTop: spacing.sm }}>
              <Text variant="caption" style={{ color: colors.brand.primary }}>
                Testing: {currentTest}
              </Text>
            </View>
          )}
        </View>

        {results.length > 0 && !isRunning && (
          <View style={{ marginBottom: spacing.xl }}>
            <View style={{ marginBottom: spacing.md }}>
              <Button 
                label="Copy Results to Clipboard" 
                onPress={copyToClipboard}
                variant="secondary"
              />
            </View>
            <View style={[styles.resultBox, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={{ fontFamily: 'monospace', color: colors.text.primary }}>
                {generateCopyableText()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  card: {
    paddingBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 150,
  },
  resultBox: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: 40,
  }
});
