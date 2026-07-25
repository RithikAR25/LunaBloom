import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../src/presentation/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system';
import { Text } from '../../src/presentation/components/ui/Text';
import { Button } from '../../src/presentation/components/ui/Button';
import { DataManagementService } from '../../src/application/services/DataManagementService';
import { useProfileStore } from '../../src/presentation/stores/useProfileStore';
import { useCycleStore } from '../../src/presentation/stores/useCycleStore';
import { SQLiteDailyLogRepository } from '../../src/infrastructure/repositories/SQLiteDailyLogRepository';

export default function DataSettingsScreen() {
  const { colors } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // We need the concrete repositories to pass into the DataManagementService
  const profileRepo = useProfileStore.getState()._repository;
  const cycleRepo = useCycleStore.getState()._repository;

  const handleExport = async () => {
    if (!profileRepo || !cycleRepo) return;
    
    setIsExporting(true);
    try {
      // Create a temporary DailyLogRepo
      const logRepo = new SQLiteDailyLogRepository();
      
      const dataService = new DataManagementService(profileRepo, cycleRepo, logRepo);
      await dataService.exportData();
    } catch {
      Alert.alert('Export Failed', 'An error occurred while exporting your data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!profileRepo || !cycleRepo) return;

    Alert.alert(
      'Warning',
      'Importing a backup will overwrite your current data. This action cannot be undone. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const logRepo = new SQLiteDailyLogRepository();
              const dataService = new DataManagementService(profileRepo, cycleRepo, logRepo);
              
              const success = await dataService.importData();
              if (success) {
                // Reload stores
                await useProfileStore.getState().loadProfile();
                await useCycleStore.getState().loadCycles();
                Alert.alert('Success', 'Data imported successfully.');
              }
            } catch (e: any) {
              Alert.alert('Import Failed', e.message || 'An error occurred while importing your data.');
            } finally {
              setIsImporting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      
      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          EXPORT DATA
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <Text style={{ color: colors.text.primary, marginBottom: spacing[4] }}>
            Save a backup of all your cycles, daily logs, and profile data to a portable JSON file.
          </Text>
          <Button 
            label="Export Backup" 
            onPress={handleExport}
            disabled={isExporting || isImporting}
            loading={isExporting}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="caption" weight="bold" style={[styles.label, { color: colors.text.secondary }]}>
          IMPORT DATA
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.semantic.error + '50' }]}>
          <Text style={{ color: colors.text.primary, marginBottom: spacing[4] }}>
            Restore your data from a LunaBloom JSON backup file. This will overwrite your existing data.
          </Text>
          <Button 
            label="Import Backup" 
            variant="danger"
            onPress={handleImport}
            disabled={isExporting || isImporting}
            loading={isImporting}
          />
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
});
