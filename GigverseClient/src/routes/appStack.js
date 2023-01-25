import { StyleSheet, Alert } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './tabNavigator'
import JobDetails from './../screens/jobDetails';
import Notifications from './../screens/notifications';
import JobApplication from './../screens/jobApplication';
import UpcomingJobDetails from './../screens/upcomingJobDetails';
import ChatDetails from './../screens/chatDetails';
import EditProfile from '../screens/editProfile';
import EditSkill from '../screens/editSkill';
import EditJob from '../screens/editJob';
import ManageJobApplication from '../screens/manageJobApplication'
import JobExecutionStepOne from '../screens/jobExecutionStepOne';
import JobExecutionStepZero from '../screens/jobExecutionStepZero';
import JobExecutionStepTwo from '../screens/jobExecutionStepTwo';
import JobExecutionStepThree from '../screens/jobExecutionStepThree';
import JobExecutionStepFour from '../screens/jobExecutionStepFour';
import { colors } from '../styles'
import AppSettings from '../screens/appSettings';
import socket from '../utils/socket';

const Stack = createNativeStackNavigator()

const AppStack = () => {


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
      initialRouteName={'TabNavigator'}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="JobDetails" component={JobDetails} options={{
        title: 'Job Details',
        headerBackVisible: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
      }} />
      <Stack.Screen name="Notifications" component={Notifications} options={{ headerBackVisible: true, }} />
      <Stack.Screen name="JobApplication" component={JobApplication} options={{
        title: 'Job Application',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="UpcomingJobDetails" component={UpcomingJobDetails} options={{
        title: 'Upcoming Job',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="ChatDetails" component={ChatDetails} options={{
        headerBackVisible: true,
      }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{
        title: 'Edit User Profile',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="EditSkill" component={EditSkill} options={{
        title: 'Edit User Skills',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="EditJob" component={EditJob} options={{
        title: 'Edit Job',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="ManageJobApplication" component={ManageJobApplication} options={{
        title: 'Manage Job Applications',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="JobExecutionStepZero" component={JobExecutionStepZero} options={{
        title: 'Ongoing Job',
        headerBackVisible: true,
      }} />
      <Stack.Screen name="JobExecutionStepOne" component={JobExecutionStepOne} options={{
        title: 'Ongoing Job',
      }} />
      <Stack.Screen name="JobExecutionStepTwo" component={JobExecutionStepTwo} options={{
        title: 'Ongoing Job',
      }} />
      <Stack.Screen name="JobExecutionStepThree" component={JobExecutionStepThree} options={{
        title: 'Ongoing Job',
      }} />
      <Stack.Screen name="JobExecutionStepFour" component={JobExecutionStepFour} options={{
        title: 'Ongoing Job',
      }} />
      <Stack.Screen name="Settings" component={AppSettings} options={{
        title: 'Settings',
        headerBackVisible: true,
      }} />
    </Stack.Navigator>
  )
}


export default AppStack

const styles = StyleSheet.create({})