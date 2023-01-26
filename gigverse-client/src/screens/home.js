import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import UpcomingJob from './../assets/jobStat/UpcomingJobs.png'
import DailyWorkingHour from './../assets/jobStat/DailyWorkingHour.png'
import HoursWorked from './../assets/jobStat/HoursWorked.png'
import Earning from './../assets/jobStat/Earning.png'
import JobStat from '../components/jobStat'
import UpcomingJobSummary from '../components/upcomingJobSummary'
import CustomStyles from '../styles'
import SavedJobSummary from '../components/savedJobSummary'
import PostedJobSummary from '../components/postedJobSummary'
import BASE_URL from './BASE_URL'
import EncryptedStorage from 'react-native-encrypted-storage';
import { useIsFocused } from '@react-navigation/native'
import { Icon } from '@rneui/base'
import { AuthContext } from '../context/AuthContext'
import Popup from '../utils/popup'
import socket from '../utils/socket'

const Home = ({ navigation }) => {

  const isFocused = useIsFocused()
  const [postedJobs, setPostedJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [upcomingJobs, setUpcomingJobs] = useState([])
  const { verified } = useContext(AuthContext)

  const getPostedJobs = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      socket.emit('configure_user', { userToken: userToken })
      socket.emit('check_joined_rooms')
      let response = await fetch(`${BASE_URL}/user/postedjobs`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        await setPostedJobs(json)
      } else setPostedJobs([])
    } catch (error) {
      console.log(error.message)
    }
  }

  const getSavedJobs = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      let response = await fetch(`${BASE_URL}/user/savedjob`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        await setSavedJobs(json)
      } else setSavedJobs([])
    } catch (error) {
      console.log(error.message)
    }
  }

  const getUpcomingJobs = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      let response = await fetch(`${BASE_URL}/user/upcomingjob`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        await setUpcomingJobs(json)
      } else setUpcomingJobs([])
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (isFocused) {
      getPostedJobs()
      getSavedJobs()
      getUpcomingJobs()
    }
  }, [isFocused])

  useEffect(() => {
    socket.on('notify_job_owner', (data) => {
      return Alert.alert('Application received!', `Someone applied to your job with id ${data.job_id}`, [
        {
          text: 'Go to job page',
          onPress: () => navigation.navigate('ManageJobApplication', { job_id: data.job_id })
        }
      ])
    })
    socket.on('notify_job_seeker', (data) => {
      return Alert.alert('Application approved!', `Your application for job with id ${data.job_id} has result, refresh your home page to see if it's you!`, [
        {
          text: 'Refresh',
          onPress: () => { navigation.replace('TabNavigator') }
        }
      ])
    })
    socket.on('notify_job_owner_schedule', (data) => {
      return Alert.alert('Job meetup details verified', `Your job seeker (User ID: ${data.seeker_user_id}) has confirmed your details. You may start the job now!`, [
        {
          text: 'OK',
          onPress: () => { navigation.replace('TabNavigator') }
        }
      ])
    })
    socket.on('notify_job_start', (data) => {
      return Alert.alert('Job started', `Your job with ID ${data.job_id} has started by another party. You may start the job now!`, [
        {
          text: 'OK',
          onPress: () => { navigation.navigate('JobExecutionStepZero', { job_id: data.job_id }) }
        }
      ])
    })
  }, [socket])


  useEffect(() => {
    {
      verified ? null : Alert.alert('User info incomplete', 'We realized you have verified yourself as either a student or an external! Do it now?', [
        {
          text: 'Go to profile',
          onPress: () => navigation.navigate('Account')
        },
        {
          text: 'Contact admin',
          // TODO: Add in contact admin function
          onPress: () => { Popup('Feature to be developed') }
        },
      ])
    }
  }, [])


  const SeeAllButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }} onPress={() => onPress()}>
        <Text style={CustomStyles.text}>See all </Text>
        <Icon name='rightcircleo' type='antdesign' size={15} />
      </TouchableOpacity>
    )
  }



  return (
    <SafeAreaProvider>
      <ScrollView style={CustomStyles.defaultScreenPadding} showsVerticalScrollIndicator={false}>

        <Text style={CustomStyles.heading4}>My Jobs</Text>
        <View style={styles.jobStatContainer}>
          <View style={{ flexDirection: 'row' }}>
            <JobStat
              imageSource={UpcomingJob}
              title={'Upcoming Jobs'}
              data={1}
            />
            <JobStat
              imageSource={HoursWorked}
              title={'Jobs Completed'}
              data={1}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <JobStat
              imageSource={Earning}
              title={'Earning This Week'}
              data={1}
            />
            <JobStat
              imageSource={DailyWorkingHour}
              title={'Hours Worked Today'}
              data={1}
            />
          </View>
        </View>
        <View style={[CustomStyles.horizontalContainer, { marginBottom: 10 }]}>
          <Text style={CustomStyles.heading4}>Upcoming Jobs</Text>
          <SeeAllButton
            onPress={() => Alert.alert('Coming soon')}
          />
        </View>
        {upcomingJobs.length > 0 ?
          <UpcomingJobSummary dataArray={upcomingJobs} navigation={navigation} />
          : <Text>No upcoming jobs</Text>}
        <View style={[CustomStyles.horizontalContainer, { marginVertical: 10 }]}>
          <Text style={CustomStyles.heading4}>Saved Jobs</Text>
          <SeeAllButton
            onPress={() => Alert.alert('Coming soon')}
          />
        </View>
        {savedJobs.length > 0 ?
          <SavedJobSummary dataArray={savedJobs} navigation={navigation} />
          : <Text>No saved jobs</Text>}
        <View style={[CustomStyles.horizontalContainer, { marginVertical: 10 }]}>
          <Text style={CustomStyles.heading4}>Posted Jobs</Text>
          <SeeAllButton
            onPress={() => Alert.alert('Coming soon')}
          />
        </View>
        {postedJobs.length > 0 ?
          <PostedJobSummary dataArray={postedJobs} navigation={navigation} />
          : <Text>No posted jobs</Text>}
      </ScrollView>
    </SafeAreaProvider>
  )
}

export default Home

const styles = StyleSheet.create({
  jobStatContainer: {
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  }
})