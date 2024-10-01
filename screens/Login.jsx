import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContextProvider';
import {
  Alert, SafeAreaView, ScrollView, Text, View, Image, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Keyboard, Animated, StyleSheet
} from 'react-native';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { setIsLoggedIn } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const imageHeight = useRef(new Animated.Value(350)).current; // Initial image height

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardOpen(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardOpen(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    // Animate image shrink when keyboard is open
    Animated.timing(imageHeight, {
      toValue: keyboardOpen ? 180 : 350, // Shrink the image height when the keyboard is open
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [keyboardOpen]);

  const handleLogin = async () => {
    if (isLoading) return;
    if(!email || !apiKey) {
      return Alert.alert('Error', 'Email and API key are required');
    }
    if(!email.includes('@')) {
      return Alert.alert('Error', 'Invalid email address');
    }
    setIsLoading(true);
    try {
      const response = await axios.post('https://demo.zinipay.com/app/auth', { email, apiKey });
      if (response.data.success) {
        Alert.alert('Success', 'Authentication successful');
        await AsyncStorage.setItem('isLoggedIn', 'true');  // Store login state
        setIsLoggedIn(true);
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Animated.Image
            source={require('../assets/login.png')}
            style={[styles.image, { height: imageHeight }]} // Animated height
          />
          <View style={styles.formContainer}>
            <Text style={styles.titleText}>Log in</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.labelText}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholder="Enter email"
                  placeholderTextColor="#707070"
                />
              </View>
              <Text style={styles.labelText}>Api Key</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry={true}
                  placeholder="Enter API key"
                  placeholderTextColor="#707070"
                />
              </View>
              <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>
                  {isLoading ? "Logging in..." : "Log in"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  image: {
    width: "100%",
    resizeMode: "contain",
    marginHorizontal: "auto",
    marginTop: 50,
  },
  formContainer: {
    flex: 1,
  },
  titleText: {
    color: "#36454F",
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: "auto",
    marginVertical: 20,
  },
  inputContainer: {
    marginHorizontal: "auto",
    width: "80%",
  },
  labelText: {
    color: "#36454F",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 9,
  },
  inputWrapper: {
    backgroundColor: "#D3D3D3",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 19,
  },
  input: {
    color: "#36454F",
    fontSize: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1976D2",
    borderRadius: 20,
    paddingVertical: 15,
    marginTop: 15,
  },
  buttonText: {
    color: "#D3D3D3",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Login;
