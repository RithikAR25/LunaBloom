import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius } from '../../src/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Heading } from '../../src/presentation/components/ui/Heading';
import { Button } from '../../src/presentation/components/ui/Button';
import { useAIAssistantStore } from '../../src/presentation/stores/useAIAssistantStore';
import { AIModelMetadata } from '../../src/application/services/AIAssistantService';
import * as DocumentPicker from 'expo-document-picker';

const GEMMA_METADATA: AIModelMetadata = {
  // Using local IP to access the host PC from the physical device over Wi-Fi
  url: 'http://192.168.1.34:8080/gemma-3-1b-it-Q4_K_M.gguf',
  // url: 'https://huggingface.co/bartowski/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf',
  size: 1_200_000_000, // Approx 1.2GB
  version: '1.0.0',
  checksumMd5: 'PLACEHOLDER_MD5',
  filename: 'gemma-3-1b-it-Q4_K_M.gguf'
};

export default function AIStorageScreen() {
  const { colors } = useTheme();
  
  
  const modelStatus = useAIAssistantStore(state => state.modelStatus);
  const error = useAIAssistantStore(state => state.error);
  const downloadProgress = useAIAssistantStore(state => state.downloadProgress);
  const downloadModel = useAIAssistantStore(state => state.downloadModel);
  const importModel = useAIAssistantStore(state => state.importModel);
  const deleteModel = useAIAssistantStore(state => state.deleteModel);
  const checkModelStatus = useAIAssistantStore(state => state.checkModelStatus);

  const [freeSpace, setFreeSpace] = useState<number | null>(null);

  useEffect(() => {
    checkModelStatus();
    if (Platform.OS !== 'web') {
      FileSystem.getFreeDiskStorageAsync().then(space => {
        setFreeSpace(space);
      }).catch(() => {});
    }
  }, [checkModelStatus]);

  const handleDownload = async () => {
    if (freeSpace !== null && freeSpace < GEMMA_METADATA.size * 1.5) {
      Alert.alert('Insufficient Storage', 'You need at least 2GB of free space to download and verify the AI model.');
      return;
    }
    
    // Using a fake/skip checksum for this demonstration since we don't have the real MD5
    // In production, the actual MD5 is provided in metadata
    await downloadModel({
      ...GEMMA_METADATA,
      // For development/demo purposes to avoid immediate failure if md5 doesn't match
      checksumMd5: GEMMA_METADATA.checksumMd5 
    });
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });
      if (result.canceled) return;
      
      const fileUri = result.assets?.[0]?.uri;
      if (!fileUri) return;
      await importModel(fileUri);
    } catch (err) {
      Alert.alert('Import Failed', 'Could not import the selected file.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete AI Model?',
      'Are you sure you want to delete the offline AI model? You will need to download it again to use LunaBloom AI.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteModel }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Heading level="h2" style={{ color: colors.text.primary, marginBottom: spacing.md }}>
          LunaBloom AI Storage
        </Heading>
        
        <Text variant="body" style={{ color: colors.text.secondary, marginBottom: spacing.xl }}>
          LunaBloom AI runs completely offline on your device, ensuring your health data never leaves your phone.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Heading level="h3" style={{ color: colors.text.primary, marginBottom: spacing.xs }}>
            Gemma 3 1B
          </Heading>
          
          <Text variant="caption" style={{ color: colors.text.tertiary, marginBottom: spacing.lg }}>
            Size: ~1.2 GB
          </Text>

          {modelStatus === 'NOT_DOWNLOADED' && (
            <View style={{ gap: spacing.md }}>
              <Button 
                label="Download AI Model"
                onPress={handleDownload}
                variant="primary"
              />
              <Button 
                label="Import from Phone Storage"
                onPress={handleImport}
                variant="secondary"
              />
            </View>
          )}

          {modelStatus === 'DOWNLOADING' && (
            <View style={styles.progressContainer}>
              <Text variant="body" style={{ color: colors.text.primary, marginBottom: spacing.sm }}>
                Downloading... {Math.round(downloadProgress * 100)}%
              </Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { backgroundColor: colors.brand.primary, width: `${Math.max(0, Math.min(100, downloadProgress * 100))}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          {modelStatus === 'VERIFYING' && (
            <View style={styles.progressContainer}>
              <Text variant="body" style={{ color: colors.text.primary, marginBottom: spacing.sm }}>
                Verifying Checksum...
              </Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                <View style={[styles.progressBarFill, { backgroundColor: colors.brand.primary, width: '100%' }]} />
              </View>
            </View>
          )}

          {(modelStatus === 'DOWNLOADED' || modelStatus === 'READY' || modelStatus === 'LOADING') && (
            <View>
              <Text variant="body" style={{ color: colors.semantic.success, marginBottom: spacing.md, fontWeight: '600' }}>
                ✓ Downloaded & Ready
              </Text>
              <Button 
                label="Delete Model to Free Space"
                onPress={handleDelete}
                variant="secondary"
              />
            </View>
          )}

          {modelStatus === 'ERROR' && (
            <View>
              <Text variant="body" style={{ color: colors.semantic.error, marginBottom: spacing.md }}>
                {error || 'Download failed. Please check your connection and try again.'}
              </Text>
              <Button 
                label="Retry Download"
                onPress={handleDownload}
                variant="primary"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.DEFAULT,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  }
});
