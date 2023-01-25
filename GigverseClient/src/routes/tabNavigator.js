import React from 'react'
import { StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AccountPage from '../screens/accountPage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from '../screens/home';
import Explore from '../screens/explore';
import Chat from '../screens/chat';
import Upload from '../screens/upload';
import { Button, Icon } from '@rneui/base'
import { colors } from '../styles';


const Tab = createBottomTabNavigator();

const TabNavigator = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <Tab.Navigator screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.secondary,
          height: '8%',
        },
        tabBarLabelStyle: {
          color: 'black',
          fontSize: 14,
          fontWeight: 'bold',
          marginTop: -1,
          marginBottom: 2,
          padding: 0,
        },
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontSize: 25,
          fontWeight: '600',
        },
        headerBackVisible: false,
        headerRight: () => (
          <Button
            onPress={() => { navigation.navigate('Notifications') }}
            buttonStyle={styles.notificationIconContainer}
          >
            <Icon name='notifications-none' type='material' size={32} />
          </Button>
        ),
      }}>
        <Tab.Screen name="Home" component={Home} options={{
          title: 'Home',
          tabBarIcon: () => (
            <Icon name='home' type='materials' size={35} style={styles.accountPageIcon} />
          ),
          tabBarOptions: {
            showIcon: true
          },
        }} />
        <Tab.Screen name="Explore" component={Explore} options={{
          title: 'Explore',
          tabBarIcon: () => (
            <Icon name='explore' type='materials' size={33} style={styles.accountPageIcon} />
          ),
          tabBarOptions: {
            showIcon: true
          },
        }} />
        <Tab.Screen name="Chat" component={Chat} options={{
          title: 'Chat',
          tabBarIcon: () => (
            <Icon name='chat' type='materials' size={35} style={styles.accountPageIcon} />
          ),
          tabBarOptions: {
            showIcon: true
          },
        }} />
        <Tab.Screen name="Upload" component={Upload} options={{
          title: 'Upload',
          tabBarIcon: () => (
            <Icon name='file-upload' type='materials' size={38} style={styles.accountPageIcon} />
          ),
          tabBarOptions: {
            showIcon: true
          },
        }} />
        <Tab.Screen name="Account" component={AccountPage} options={{
          title: 'Account',
          tabBarIcon: () => (
            <Icon name='account-circle' type='materials' size={35} style={styles.accountPageIcon} />
          ),
          tabBarOptions: {
            showIcon: true
          },
        }} />
      </Tab.Navigator>
    </SafeAreaProvider >
  )
}

const styles = StyleSheet.create({
  accountPageIcon: {
    marginTop: 5,
  },
  notificationIconContainer: {
    backgroundColor: 'rgba(52, 52, 52, 0.0)',
  },
})

export default TabNavigator;