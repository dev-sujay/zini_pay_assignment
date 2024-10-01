import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

const Status = ({isRegistered}) => {
  return (
    <View style={[{backgroundColor : isRegistered ? "#E0FFE5" : "#fce8ef"}, styles.container]}>
      <View style={[{backgroundColor: isRegistered ? '#4CD964' : 'red'}, styles.innerContainer]}>
      <AntDesign name={isRegistered ? "check" : "close"} size={50} color="white" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 180,
        width: 180,
        borderRadius: 100,
        marginHorizontal: 'auto',
        marginVertical: 30,
        marginTop: 50,
    },
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
        width: 100,
        borderRadius: 100,
        marginHorizontal: 'auto',
    }
})

export default Status