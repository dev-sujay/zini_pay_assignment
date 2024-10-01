import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import Login from '../screens/Login';
import { AppContext } from '../context/AppContextProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';



const Routes = () => {

    const { isLoading, setIsLoading, isLoggedIn, setIsLoggedIn } = React.useContext(AppContext);
    const Stack = createStackNavigator();

    const checkLoginStatus = async () => {
        setIsLoading(true);
        try {
            const loggedIn = await AsyncStorage.getItem('isLoggedIn');
            if (loggedIn === "true") {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.log('Error checking login status', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);


    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {
                isLoggedIn ?
                    <Stack.Screen name="Home" component={Home} />
                    :
                    <Stack.Screen name="Login" component={Login} />
            }
        </Stack.Navigator>
    )
}

export default Routes