import React, { useEffect, useState } from 'react'
import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, Pressable } from 'react-native'
import Status from '../components/Status'
import {TASK_NAME} from "../config/utils"
import { startNotification, stopNotification } from '../config/notification'



const Home = () => {

  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkStatusAsync();
  }, []);

  const checkStatusAsync = async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    setIsRegistered(isRegistered);
    } catch (error) {
      console.log('Error checking status:', error)
    }
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundTask();
    }
    checkStatusAsync();
  };

  const registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60, // seconds,
        stopOnTerminate: false, // Keep running when the app is terminated
        startOnBoot: true, // Start task after the device reboots
      })
      startNotification();
      console.log("Task registered", TASK_NAME)
    } catch (err) {
      console.log("Task Register failed:", err)
    }
  }

  async function unregisterBackgroundFetchAsync() {
    try {
      console.log('Unregistered:', TASK_NAME)
      await stopNotification();
      return await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
    } catch (error) {
      console.log('Error unregistering task:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Status isRegistered={isRegistered} />
        <Text style={styles.text}>{
          isRegistered ? 'Active' : 'Inactive'
        }</Text>
        <Pressable style={styles.btn} onPress={toggleFetchTask}>
          <Text style={styles.btnText}>{
            isRegistered ? 'Stop' : 'Start'
          }</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000000',
    fontSize: 36,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 50,
    marginHorizontal: 'auto',
    width: '50%',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Home
