import { NavigationContainer } from '@react-navigation/native';
import Routes from './components/Routes';
import AppContextProvider from './context/AppContextProvider';
import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import { TASK_NAME } from "./config/utils"
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


const App = () => {

  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState([]);
  const [notification, setNotification] = useState(
    undefined
  );
  const notificationListener = useRef();
  const responseListener = useRef();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  //task background
  TaskManager.defineTask(TASK_NAME, async () => {
    try {
      // fetch data here...
      const msg = {
        "message": "Test message now",
        "from": "+1234567890",
        "timestamp": new Date().toISOString()
      }
      handleIncomingSMS(msg)
      return BackgroundFetch.BackgroundFetchResult.NewData
    } catch (err) {
      console.log("Error with task", err)
    }
  })

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  //appstate
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Listen for network status changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        // Sync stored SMS messages when the connection is restored
        syncStoredSMS();
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Store incoming SMS messages locally
  const storeSMSLocally = async (sms) => {
    try {
      const storedSMS = await AsyncStorage.getItem('storedSMS');
      const smsList = storedSMS ? JSON.parse(storedSMS) : [];
      smsList.push(sms); // Add new SMS to the list
      await AsyncStorage.setItem('storedSMS', JSON.stringify(smsList));
    } catch (error) {
      console.error('Error storing SMS:', error);
    }
  };

  // Sync stored SMS messages to the server
  const syncStoredSMS = async () => {
    try {
      const storedSMS = await AsyncStorage.getItem('storedSMS');
      if (storedSMS) {
        const smsList = JSON.parse(storedSMS);
        for (const sms of smsList) {
          await axios.post('https://demo.zinipay.com/sms/sync', sms);
        }
        // Clear stored SMS after syncing
        await AsyncStorage.removeItem('storedSMS');
      }
    } catch (error) {
      console.error('Error syncing SMS:', error);
    }
  };

  // Example function to handle incoming SMS
  const handleIncomingSMS = (sms) => {
    if (isConnected) {
      // If connected, sync SMS immediately
      axios.post('https://demo.zinipay.com/sms/sync', sms)
        .then(() => console.log('SMS synced successfully'))
        .catch(err => {
          console.error('Error syncing SMS:', err);
          storeSMSLocally(sms); // Store locally if there's an error
        });
    } else {
      // If not connected, store SMS locally
      storeSMSLocally(sms);
    }
  };


  return (
    <AppContextProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AppContextProvider>
  );
};

export default App;
