import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Startup from './../screens/startup';
import AuthMethod from './../screens/authMethod';
import Login from './../screens/login';
import Register from './../screens/register';
import { colors } from '../styles'

const Stack = createNativeStackNavigator()

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontSize: 25,
          fontWeight: 'bold',
        },
        headerBackVisible: false,
        headerShadowVisible: false
      }}
      initialRouteName={'Startup'}
    >
      <Stack.Screen name="Startup" component={Startup} options={{ headerShown: false }} />
      <Stack.Screen name="AuthMethod" component={AuthMethod} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: true }} />
    </Stack.Navigator>
  )
}

export default AuthStack

const styles = StyleSheet.create({})