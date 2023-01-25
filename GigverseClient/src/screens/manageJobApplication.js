import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomStyles from '../styles'
import EncryptedStorage from 'react-native-encrypted-storage'
import NormalButton from '../components/normalButton'
import BASE_URL from './BASE_URL'
import getTime from '../utils/getTime'
import socket from '../utils/socket'

const ManageJobApplication = ({ route, navigation }) => {
  const { job_id } = route.params
  const [jobInfo, setJobInfo] = useState({})
  const [jobApplications, setJobApplications] = useState([])
  const [loading, setLoading] = useState(false)

  const FetchJobDataByID = async () => {
    try {
      const response = await fetch(`${BASE_URL}/job/view/${job_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        if (json.length == 0) return
        else {
          await setJobInfo(json.jobInfo)
          return
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const FetchJobApplications = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/owner/viewapplications/${job_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        if (json.length == 0) return
        else {
          await setJobApplications(json)
          return
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const acceptJobApplication = async (seeker_user_id) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/owner/acceptjobapplication`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          seeker_user_id: seeker_user_id,
          job_id: job_id
        })
      })
      if (response.status === 200) {
        Alert.alert(`Congratulations, contact user ID ${seeker_user_id}`)
        socket.emit('job_approval', { userToken: userToken, job_id: job_id })
        navigation.goBack()
      } else {
        const message = await response.json()
        Alert.alert(message.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    setLoading(true)
    FetchJobDataByID()
    FetchJobApplications()
    setLoading(false)
  }, [])

  return (
    <ScrollView style={CustomStyles.defaultScreenView}>
      <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
      <View style={CustomStyles.horizontalContainer}>
        <Text style={CustomStyles.infoTextLabel}>Job ID</Text>
        <Text style={CustomStyles.infoTextContent}>: {jobInfo.job_id}</Text>
      </View>
      <View style={CustomStyles.horizontalContainer}>
        <Text style={CustomStyles.infoTextLabel}>Application Deadline</Text>
        {/* <Text style={CustomStyles.infoTextContent}>: {new Date(jobInfo.application_deadline).toISOString().split('.')[0].replace('T', ' ')}</Text> */}
        <Text style={CustomStyles.infoTextContent}>: {new Date(getTime(jobInfo.application_deadline)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
      </View>
      <View style={CustomStyles.horizontalContainer}>
        <Text style={CustomStyles.infoTextLabel}>Completion Deadline</Text>
        {/* <Text style={CustomStyles.infoTextContent}>: {new Date(jobInfo.completion_deadline).toISOString().split('.')[0].replace('T', ' ')}</Text> */}
        <Text style={CustomStyles.infoTextContent}>: {new Date(getTime(jobInfo.completion_deadline)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
      </View>
      <View style={CustomStyles.horizontalContainer}>
        <Text style={CustomStyles.infoTextLabel}>Number of applicants</Text>
        <Text style={CustomStyles.infoTextContent}>: {jobApplications.length}</Text>
      </View>
      {loading ? <Text>loading...</Text> : jobApplications?.map((application, index) => (
        <View key={index} style={styles.applicationContent}>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Application ID</Text>
            <Text style={[CustomStyles.infoTextContent, { left: 120 }]}>: {application.application_id}</Text>
          </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Job Seeker ID</Text>
            <Text style={[CustomStyles.infoTextContent, { left: 120 }]}>: {application.seeker_user_id}</Text>
          </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Price Bid</Text>
            <Text style={[CustomStyles.infoTextContent, { left: 120 }]}>: RM {application.price_bid}</Text>
          </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Description</Text>
            <Text style={[CustomStyles.infoTextContent, { left: 120 }]}>: {application.description}</Text>
          </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Remarks</Text>
            <Text style={[CustomStyles.infoTextContent, { left: 120 }]}>: {application.remarks}</Text>
          </View>
          <NormalButton
            customButtonStyling={{ width: 'auto', marginVertical: 10 }}
            customLabelStyling={{ fontSize: 18, fontWeight: 'bold' }}
            label='Chat with job seeker'
          />
          <NormalButton
            customButtonStyling={{ width: 'auto', backgroundColor: 'green' }}
            customLabelStyling={{ fontSize: 18, fontWeight: 'bold' }}
            label='Accept'
            onPress={() => {
              Alert.alert(
                'Are you sure?',
                'Accepting this job application will means you reject the others',
                [
                  { text: "Cancel", style: 'cancel', onPress: () => { } },
                  {
                    text: 'I am sure',
                    onPress: () => {
                      acceptJobApplication(application.seeker_user_id)
                    },
                  },
                ]
              )
            }}
          />
        </View>
      ))}
    </ScrollView>
  )
}

export default ManageJobApplication

const styles = StyleSheet.create({
  applicationContent: {
    borderWidth: 1,
    marginVertical: 5,
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
})