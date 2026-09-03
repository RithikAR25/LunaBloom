import { Platform } from 'react-native';
import { CyclePredictionService } from '../../domain/prediction';
import type { CycleEntry } from '../../domain/models/Cycle';
import type { UserProfile } from '../../domain/models/UserProfile';
import { addDays, isAfter, todayISO } from '../../utils/dateUtils';

import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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
   * Synchronizes all scheduled notifications with the current cycle and profile data.
   * Cancels existing app-managed notifications and rebuilds the desired schedule.
   */
  static async syncScheduledNotifications(
    cycles: CycleEntry[],
    profile: UserProfile | null
  ): Promise<void> {
    await this.cancelAllNotifications();

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // 1. Cycle Reminders
    if (profile?.cycleRemindersEnabled && cycles.length > 0) {
      const predictionService = new CyclePredictionService();
      const prediction = predictionService.predict(cycles);

      if (prediction) {
        const today = todayISO();

        // Period Reminder (2 days before)
        const reminderDate = addDays(prediction.nextPeriodStart, -2);
        if (isAfter(reminderDate, today)) {
          await this.scheduleNotification(
            'Period Approaching',
            'Your period is expected to start in about 2 days.',
            new Date(`${reminderDate}T09:00:00`)
          );
        }

        // Ovulation/Fertile Window Reminder (at start of fertile window)
        if (prediction.fertileWindowStart && isAfter(prediction.fertileWindowStart, today)) {
          await this.scheduleNotification(
            'Fertile Window',
            'Your fertile window is starting soon.',
            new Date(`${prediction.fertileWindowStart}T09:00:00`)
          );
        }
      }
    }

    // 2. Daily Intimacy Reminder
    if (profile?.intimacyReminderEnabled && profile.intimacyReminderTime) {
      const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (TIME_PATTERN.test(profile.intimacyReminderTime)) {
        const [hourStr, minuteStr] = profile.intimacyReminderTime.split(':');
        const hour = parseInt(hourStr || '0', 10);
        const minute = parseInt(minuteStr || '0', 10);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Daily intimacy reminder',
            body: "Take a moment to log today's intimacy.",
          },
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour, 
            minute
          },
        });
      }
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
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate
        },
      });
    }
  }
}
