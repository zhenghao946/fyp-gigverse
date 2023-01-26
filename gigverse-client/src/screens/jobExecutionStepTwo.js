import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomStyles from '../styles'
import BigButton from '../components/bigButton'
import CountDownTimer from '../components/CountDownTimer'
import { Overlay } from '@rneui/base'
import EncryptedStorage from 'react-native-encrypted-storage'
import socket from '../utils/socket'

const JobExecutionStepTwo = ({ route, navigation }) => {

  const { job_id, jobInfo } = route.params
  const job_duration_end = new Date().getTime() + (jobInfo.duration * 60 * 1000)
  const [jobEnded, setJobEnded] = useState(false)
  const [durationEnded, setDurationEnded] = useState(false)

  const RequestExtendJobDuration = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')

    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    socket.on('job_end', (data) => {
      return (
        Alert.alert('Close the job', `You are about to end the job duration for job ID: ${data.job_id}.Proceed?`, [
          {
            text: 'OK',
            onPress: () => {
              setJobEnded(true)
              navigation.navigate('JobExecutionStepThree', {
                job_id: job_id,
                jobInfo: jobInfo
              })
            }
          },
          {
            text: 'Cancel',
            onPress: () => { }
          }
        ])
      )
    })
  }, [socket])

  return (
    <View style={CustomStyles.defaultScreenView}>
      <ScrollView style={{ height: '80%' }}>
        <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
        <View style={{ alignSelf: 'center', marginTop: 10 }}>
          <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>{`Step 2: Begin the job duration count`}</Text>
          <Text style={[CustomStyles.text, { textAlign: 'center', marginTop: 10 }]}>Duration remaining: </Text>
          {!jobEnded && durationEnded ?
            <Overlay isVisible={durationEnded} overlayStyle={styles.overlayContainer} collapsable={false}>
              <Text style={styles.overlayText}>
                Unfortunately, the job's duration has ended at: {new Date(job_duration_end).toUTCString()}
                {'\n\n'}Either end the job or extend
              </Text>
              <BigButton
                label={'Extend job duration'}
                customButtonStyling={{ marginBottom: 0 }}
                customLabelStyling={{ fontSize: 20 }}
              />
              <BigButton
                label={'Close the job'}
                customButtonStyling={{ marginBottom: 0 }}
                customLabelStyling={{ fontSize: 20 }}
                onPress={() => navigation.navigate('JobExecutionStepThree', {
                  job_id: job_id,
                  jobInfo: jobInfo
                })}
              />
            </Overlay> : null}
          {durationEnded ? null : <CountDownTimer
            targetDate={job_duration_end}
            onCountDownFinished={() => setDurationEnded(true)}
          />}
          <Text style={[CustomStyles.text, { textAlign: 'center', marginTop: 10 }]}>Job duration ends at: </Text>
          <Text style={[CustomStyles.heading4, { fontSize: 35, textAlign: 'center' }]}>{new Date(job_duration_end).toLocaleString().split(',')[1]}</Text>
          <Text style={[CustomStyles.heading5, { textAlign: 'center' }]}>4th Jan 2023, Friday</Text>
        </View>
      </ScrollView>
      <BigButton
        label={'Extend job duration'}
        customButtonStyling={{ height: '7%', marginBottom: 0, backgroundColor: 'green' }}
        customLabelStyling={{ fontSize: 17 }}
      />
      <BigButton
        label={'Step 3: Close the job'}
        customButtonStyling={{ height: '7%' }}
        customLabelStyling={{ fontSize: 17 }}
        onPress={() => {
          jobEnded ? navigation.navigate('JobExecutionStepThree') : socket.emit('job_end_confirmation', { job_id: job_id })
        }}
      />
    </View>
  )
}

export default JobExecutionStepTwo

const styles = StyleSheet.create({
  overlayContainer: {
    backgroundColor: '#fff',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  overlayText: {
    color: '#000',
    fontSize: 20,
    textAlign: 'center'
  },
})