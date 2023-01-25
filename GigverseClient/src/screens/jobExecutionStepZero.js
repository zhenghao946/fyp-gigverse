import { Alert, ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomStyles, { UpcomingJobStatusRender } from '../styles'
import BigButton from '../components/bigButton'
import BASE_URL from './BASE_URL'
import EncryptedStorage from 'react-native-encrypted-storage'
import getTime from '../utils/getTime'

const JobExecutionStepZero = ({ route, navigation }) => {
  const { job_id } = route.params
  const [jobInfo, setJobInfo] = useState({})
  const [jobImages, setJobImages] = useState([])
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    async function FetchJobDataByID() {
      try {
        let userToken = await EncryptedStorage.getItem('userToken')
        const response = await fetch(`${BASE_URL}/user/upcomingjob/${job_id}`, {
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
            await setJobInfo(json.jobInfo)
            await setUserRole(json.user_role)
            await setJobImages(json.job_images)
            return
          }
        } else {
          const json = await response.json()
          Alert.alert(json.message)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    FetchJobDataByID()
    // GetTokenInfo()
  }, [])

  return (
    <View style={CustomStyles.defaultScreenView}>
      <ScrollView style={{ height: '90%' }}>
        <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
        <Text style={CustomStyles.heading6}>RM {jobInfo.price}</Text>
        <View style={CustomStyles.horizontalContainer}>
          <Text style={CustomStyles.infoTextLabel}>Status: </Text>
          {UpcomingJobStatusRender(jobInfo.job_execution_status)}
        </View>
        <Text style={CustomStyles.infoTextLabel}>Job description</Text>
        <Text>{jobInfo.description}</Text>
        <Text style={CustomStyles.text}>Attachment</Text>
        {jobImages.length > 0 ? <View style={CustomStyles.horizontalContainer}>
          {jobImages.map((image, index) => (
            <Image key={index} source={{ uri: `data:image/jpeg;base64, ${image.uri}` }} style={CustomStyles.profilePicThumbnail} />
          ))}
        </View>
          : <Text>No attachment(s)</Text>}
        <Text style={CustomStyles.text}>Deadline</Text>
        <Text>{new Date(getTime(jobInfo.completion_deadline)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
        <Text style={CustomStyles.text}>Meet up date and time</Text>
        <Text>{new Date(getTime(jobInfo.meetup_datetime)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
        <Text style={CustomStyles.text}>Meet up Location</Text>
        <Text>{jobInfo.meetup_location}</Text>
        <Text style={CustomStyles.text}>Duration</Text>
        <Text>{jobInfo.duration} minutes</Text>
      </ScrollView>
      <BigButton
        label={'Step 1: Meet up with job owner/seeker'}
        customButtonStyling={{ height: '7%' }}
        customLabelStyling={{ fontSize: 17 }}
        onPress={() => {
          Alert.alert('Job execution', 'Starting this process is irreversible. Continue?', [
            { text: 'Cancel' },
            {
              text: 'Let\'s go',
              onPress: () => navigation.navigate('JobExecutionStepOne', {
                job_id: job_id,
                jobInfo: { ...jobInfo, user_role: userRole }
              })
            }
          ])
        }}
      />
    </View>
  )
}

export default JobExecutionStepZero

const styles = StyleSheet.create({})