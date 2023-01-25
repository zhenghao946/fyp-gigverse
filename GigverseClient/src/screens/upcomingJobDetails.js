import { Alert, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import CustomStyles, { UpcomingJobStatusRender } from '../styles'
import BASE_URL from './BASE_URL'
import EncryptedStorage from 'react-native-encrypted-storage'
import BigButton from '../components/bigButton'
import DateTimePicker from '../components/dateTimePicker'
import { Formik, useFormikContext } from 'formik'
import FormikInput from '../components/FormikInput'
import Popup from '../utils/popup'
import socket from '../utils/socket'

const UpcomingJobDetails = ({ route, navigation }) => {
  const { job_id } = route.params
  const [jobInfo, setJobInfo] = useState({})
  const [jobImages, setJobImages] = useState([])
  const [isChanged, setIsChanged] = useState(false)
  const isFirstRender = useRef(true)
  const [userRole, setUserRole] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const UpdateJobScheduling = async (values) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/execute/schedule`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          job_id: job_id,
          completion_deadline: values.completion_deadline,
          meetup_datetime: values.meetup_datetime,
          meetup_location: values.meetup_location,
          duration: Number(values.duration)
        })
      })
      if (response.status === 200) {
        await setSubmitted(true)
        await setIsChanged(false)
        Alert.alert('Job schedule updated!')
        navigation.goBack()
      } else {
        const json = await response.json()
        Alert.alert(json.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

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
            return isFirstRender.current = false
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
  }, [])

  useEffect(() =>
    navigation.addListener('beforeRemove', (e) => {
      if (!isChanged) {
        return;
      }
      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes.',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => { } },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    }), [navigation, isChanged])

  useEffect(() => {
    socket.on('notify_job_owner_schedule', (data) => {
      return Alert.alert('Job meetup details verified', `Your job seeker (User ID: ${data.seeker_user_id}) has confirmed your details. You may start the job now!`, [
        {
          text: 'OK',
          onPress: () => { setIsChanged(false) }
        }
      ])
    })

  }, [socket])

  const verifyMeetupDetails = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/seeker/verifymeetupdetail`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ job_id: job_id })
      })
      if (response.status === 200) {
        socket.emit('verify_meetup_details', { job_id: job_id, seeker_user_id: jobInfo.seeker_user_id })
        setIsChanged(false)
        navigation.replace('UpcomingJobDetails', { job_id: job_id })
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const checkJobExecutionStatus = () => {
    if (!jobInfo.meetup_detail_verified) return true
    else if (isChanged === true) return true
    else return false
  }

  const FormObserver = () => {
    const { values, initialValues } = useFormikContext()
    useEffect(() => {
      // if (!isFirstRender.current)
      setIsChanged(true)
      // isFirstRender.current = false
    }, [initialValues])
    return null;
  }

  if (jobInfo.job_execution_status === 'completed') return (
    <>
      <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>Job is done! Explore for more?</Text>
      <BigButton
        label={'Back to home'}
        onPress={() => navigation.navigate('Home')}
      />
    </>
  )
  else if (jobInfo.job_execution_status === 'pending payment') {
    if (userRole === 'job_owner') return (
      <>
        <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>Your job is completed but you haven't make your payment! Please do so as this means a lot to our job seekers</Text>
        <BigButton
          label={'Pay now'}
          onPress={() => navigation.navigate('JobExecutionStepThree', { job_id: job_id, jobInfo: { ...jobInfo, user_role: userRole } })}
        />
      </>
    )
    else return (
      <>
        <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>Your job is complete but you haven't get your payment! Please be informed that we are aware of the situation and trying our best to get it done</Text>
        <TouchableOpacity onPress={() => Popup('Feature to be developed')}>
          <Text style={[CustomStyles.hyperlinkText, { textAlign: 'center' }]}>Lodge a complaint</Text>
        </TouchableOpacity>
      </>
    )
  }
  else return (
    <View style={CustomStyles.defaultScreenView}>
      <Formik
        initialValues={{ ...jobInfo }}
        enableReinitialize={true}
        onSubmit={async (values) => {
          await UpdateJobScheduling(values)
        }}
      >
        {formikProps => (
          <View>
            <ScrollView style={{ height: isChanged ? '83%' : (!jobInfo.meetup_detail_verified ? '83%' : '90%') }}>
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
              {userRole === 'job_seeker' ?
                <Text style={[CustomStyles.text, { marginVertical: 10, fontStyle: 'italic' }]}>To job seeker: {'\n'}Please make sure you check these job details and verify them, only then the job can begin!</Text>
                : null}
              {!isFirstRender.current && !submitted ? <FormObserver /> : null}
              <DateTimePicker
                formikProps={formikProps}
                label={'Deadline'}
                value={'completion_deadline'}
              >
                {userRole === 'job_owner' ? <View style={CustomStyles.normalButton}>
                  <Text style={CustomStyles.normalButtonText}>Edit Job Deadline</Text>
                </View> : null}
              </DateTimePicker>
              <DateTimePicker
                formikProps={formikProps}
                label={'Meet up date and time'}
                value={'meetup_datetime'}
              >
                {userRole === 'job_owner' ? <View style={CustomStyles.normalButton}>
                  <Text style={CustomStyles.normalButtonText}>Edit Meetup Date/Time</Text>
                </View> : null}
              </DateTimePicker>
              <FormikInput
                formikProps={formikProps}
                label='Meet up location'
                value='meetup_location'
                disabled={userRole === 'job_seeker' ? true : false}
              />
              <FormikInput
                formikProps={formikProps}
                label='Duration'
                value='duration'
                minute={true}
                disabled={userRole === 'job_seeker' ? true : false}
              />
            </ScrollView>
            {isChanged && userRole === 'job_owner' === true ?
              <View style={{ height: '8%' }}>
                <BigButton
                  label={'Save Changes'}
                  disable={!isChanged}
                  onPress={formikProps.handleSubmit}
                />
              </View>
              : null}
            {userRole === 'job_seeker' && !jobInfo.meetup_detail_verified ?
              <View style={{ height: '8%' }}>
                <BigButton
                  label={'Verify meetup details'}
                  disable={jobInfo.meetup_detail_verified}
                  onPress={() => verifyMeetupDetails()}
                />
              </View>
              : null
            }
            <View style={{ height: isChanged ? '8%' : (!jobInfo.meetup_detail_verified ? '8%' : '10%') }}><BigButton
              label={'Start the job'}
              onPress={() => {
                socket.emit('job_execution', { job_id: job_id })
                navigation.navigate('JobExecutionStepZero', { job_id: job_id })
              }}
              disable={checkJobExecutionStatus()}
            />
            </View>
          </View>
        )}
      </Formik>
    </View>
  )
}

export default UpcomingJobDetails

const styles = StyleSheet.create({})