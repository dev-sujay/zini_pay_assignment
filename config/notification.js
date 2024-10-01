import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

async function scheduleNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "SMS Syncing Active",
      body: "Syncing SMS in the background.",
      sticky: true,
      sound: true,
      priority : Notifications.AndroidNotificationPriority.HIGH, 
    },
    trigger: null
  });
}

export const startNotification = async () => {
  scheduleNotification();
};

export const stopNotification = async () => {
  Notifications.cancelAllScheduledNotificationsAsync();
}
