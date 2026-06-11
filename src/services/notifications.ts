import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { subDays, startOfDay, setHours, setMinutes } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('expiry-alerts', {
      name: 'Expiry Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2D6A4F',
    });
  }
  return finalStatus === 'granted';
}

export async function scheduleExpiryNotification(
  itemId: string,
  itemName: string,
  expiryDate: Date,
  warningDays: number,
  notificationHour = 8
): Promise<string | null> {
  const warningDate = subDays(expiryDate, warningDays);
  const triggerDate = setMinutes(setHours(startOfDay(warningDate), notificationHour), 0);
  if (triggerDate < new Date()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🕐 Expiring Soon — UseItUp',
      body: `${itemName} expires in ${warningDays} day${warningDays !== 1 ? 's' : ''}. Use it up!`,
      data: { itemId },
      sound: true,
    },
    trigger: { date: triggerDate } as Notifications.DateTriggerInput,
  });
}

export const cancelNotification = (id: string) =>
  Notifications.cancelScheduledNotificationAsync(id);

export const cancelAllNotifications = () =>
  Notifications.cancelAllScheduledNotificationsAsync();
