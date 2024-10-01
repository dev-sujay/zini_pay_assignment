import { View, Text } from 'react-native'
import React from 'react'

export const AppContext = React.createContext()

const AppContextProvider = ({ children }) => {

    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    return (
        <AppContext.Provider value={{ isLoading, setIsLoading, isLoggedIn, setIsLoggedIn }}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider