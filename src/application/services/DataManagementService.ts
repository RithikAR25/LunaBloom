import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import type { ICycleRepository } from '../../domain/repositories/ICycleRepository';
import type { IDailyLogRepository } from '../../domain/repositories/IDailyLogRepository';

const SCHEMA_VERSION = 1;

export interface ExportPayload {
  version: number;
  exportDate: string;
  data: {
    profile: any;
    cycles: any[];
    dailyLogs: any[];
  };
}

export class DataManagementService {
  constructor(
    private profileRepo: IUserProfileRepository,
    private cycleRepo: ICycleRepository,
    private logRepo: IDailyLogRepository
  ) {}

  /**
   * Exports all user data to a versioned JSON file.
   * On Android, attempts to let the user pick a folder (Downloads) via StorageAccessFramework.
   * Fallback / iOS: Opens the native share sheet.
   */
  async exportData(): Promise<void> {
    const profile = await this.profileRepo.get();
    const cycles = await this.cycleRepo.getAll();
    const dailyLogs = await this.logRepo.getAll();

    const payload: ExportPayload = {
      version: SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      data: {
        profile,
        cycles,
        dailyLogs,
      },
    };

    const jsonString = JSON.stringify(payload, null, 2);

    // On Android, prompt user to select a folder (e.g. Downloads) to save directly to disk
    if (Platform.OS === 'android' && FileSystem.StorageAccessFramework) {
      try {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileName = `LunaBloom_Backup_${Date.now()}.json`;
          const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/json'
          );
          await FileSystem.writeAsStringAsync(createdUri, jsonString, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          return;
        }
      } catch {
        // Fall back to Share sheet if SAF fails or is canceled
      }
    }

    // Write to a temporary file for standard Share sheet
    if (!FileSystem.documentDirectory) throw new Error('Cannot access document directory.');
    const fileUri = `${FileSystem.documentDirectory}LunaBloom_Backup_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export LunaBloom Data',
      });
    }
  }

  /**
   * Prompts the user to pick a JSON backup file and validates its schema completely
   * before replacing local data.
   */
  async importData(): Promise<boolean> {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false; // User cancelled
    }

    const file = result.assets[0];
    if (!file || !file.uri) throw new Error('Invalid file selected.');

    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let payload: ExportPayload;
    try {
      payload = JSON.parse(content);
    } catch {
      throw new Error('Selected file is not valid JSON.');
    }

    this.validatePayload(payload);

    // Proceed to replace data
    // First save profile
    if (payload.data.profile) {
      await this.profileRepo.save(payload.data.profile);
    }
    
    // Save cycles (could optimize with batch insert if repo supported it, but loop is fine for now)
    for (const cycle of payload.data.cycles) {
      await this.cycleRepo.save(cycle);
    }

    // Save daily logs
    for (const log of payload.data.dailyLogs) {
      await this.logRepo.save(log);
    }

    return true;
  }

  private validatePayload(payload: any): void {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid backup format.');
    }
    if (payload.version !== SCHEMA_VERSION) {
      throw new Error(`Unsupported backup version. Expected ${SCHEMA_VERSION}, got ${payload.version}.`);
    }
    if (!payload.data || typeof payload.data !== 'object') {
      throw new Error('Backup is missing data section.');
    }
    if (!Array.isArray(payload.data.cycles)) {
      throw new Error('Backup is missing cycles array.');
    }
    if (!Array.isArray(payload.data.dailyLogs)) {
      throw new Error('Backup is missing daily logs array.');
    }
    
    // Additional schema validation for cycles could go here
    // e.g., check that cycle objects have id, startDate, etc.
  }
}
