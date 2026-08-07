import { Platform } from 'react-native';
import { CyclePredictionService } from '../../domain/prediction';
import type { CycleEntry } from '../../domain/models/Cycle';
import { addDays, isAfter, todayISO } from '../../utils/dateUtils';

// Mocked expo-notifications since Expo Go SDK 53+ throws an error when importing it
const Notifications = {
  AndroidImportance: { MAX: 5 },
  setNotificationHandler: (_handler: any) => {},
  setNotificationChannelAsync: async (_id: string, _options: any) => {},
  getPermissionsAsync: async () => ({ status: 'granted' }),
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  cancelAllScheduledNotificationsAsync: async () => {},
  scheduleNotificationAsync: async (_options: any) => {},
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  /**
   * Requests permissions for notifications.
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  }

  /**
   * Clears all scheduled notifications.
   */
  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Schedules period and ovulation reminders based on predictions.
   * Driven strictly by the domain's CyclePredictionService.
   */
  static async scheduleReminders(cycles: CycleEntry[]): Promise<void> {
    await this.cancelAllNotifications();

    const hasPermission = await this.requestPermissions();
    if (!hasPermission || cycles.length === 0) return;

    const predictionService = new CyclePredictionService();
    const prediction = predictionService.predict(cycles);

    if (!prediction) return;

    const today = todayISO();

    // 1. Period Reminder (2 days before)
    const reminderDate = addDays(prediction.nextPeriodStart, -2);
    if (isAfter(reminderDate, today)) {
      await this.scheduleNotification(
        'Period Approaching',
        'Your period is expected to start in about 2 days.',
        new Date(`${reminderDate}T09:00:00`)
      );
    }

    // 2. Ovulation/Fertile Window Reminder (at start of fertile window)
    if (prediction.fertileWindowStart && isAfter(prediction.fertileWindowStart, today)) {
      await this.scheduleNotification(
        'Fertile Window',
        'Your fertile window is starting soon.',
        new Date(`${prediction.fertileWindowStart}T09:00:00`)
      );
    }
  }

  /**
   * Reschedules reminders without requesting permissions.
   * Useful to call silently when cycle data changes.
   */
  static async rescheduleIfEnabled(cycles: CycleEntry[]): Promise<void> {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      await this.scheduleReminders(cycles);
    }
  }

  private static async scheduleNotification(title: string, body: string, triggerDate: Date) {
    // Only schedule if in the future
    if (triggerDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: triggerDate,
      });
    }
  }
}
