import React, { useContext } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { AuthContext } from '../context/AuthContext'

import AuthStack from './authStack'
import AppStack from './appStack'
import { ActivityIndicator, View } from 'react-native'

const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext)

  if (isLoading) {
    () => {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={'large'} />
        </View>
      )
    }
  }

  return (
    <NavigationContainer>
      {userToken != null ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

export default AppNav