import { Text, View, ScrollView, Modal, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomStyles, { UpcomingJobStatusRender } from '../styles'
import BigButton from '../components/bigButton'
import { WebView } from 'react-native-webview';
import BASE_URL from './BASE_URL'
import getTime from '../utils/getTime';
import EncryptedStorage from 'react-native-encrypted-storage'

const JobExecutionStepThree = ({ route, navigation }) => {
  const { job_id, jobInfo } = route.params
  const [visible, setVisible] = useState(false)
  const [URL, setURL] = useState('')
  const [paid, setPaid] = useState(false)
  const [jobPaymentInfo, setJobPaymentInfo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function GenerateBill() {
      try {
        let userToken = await EncryptedStorage.getItem('userToken')
        const response = await fetch(`${BASE_URL}/job/payment/generatebill`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            collection_id: "yus1_fpo",
            description: "testing through Postman",
            email: "liewzh19990406@gmail.com",
            name: "Zheng Hao",
            amount: jobInfo.price * 100,
            job_id: jobInfo.job_id,
            seeker_user_id: jobInfo.seeker_user_id
          })
        })
        if (response.status === 200) {
          const json = await response.json()
          await setJobPaymentInfo(json)
          setURL(`https://www.billplz-sandbox.com/bills/${json.payment_id}`)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    setLoading(true)
    GenerateBill()
    setLoading(false)
  }, [])

  const JobSummary = () => (<>
    <Text style={[CustomStyles.heading6, { marginTop: 10 }]}>Summary of job:</Text>
    <View style={CustomStyles.horizontalContainer}>
      <Text style={CustomStyles.infoTextLabel}>Status: </Text>
      {UpcomingJobStatusRender(jobPaymentInfo.job_execution_status)}
    </View>
    <Text style={CustomStyles.infoTextLabel}>Job description:</Text>
    <Text>{jobInfo.description || 'null'}</Text>
    <Text style={CustomStyles.infoTextLabel}>Duration:</Text>
    <Text>{jobInfo.duration || 'null'} minutes</Text>
    <Text style={CustomStyles.infoTextLabel}>Bidded price:</Text>
    <Text>null</Text>
    <Text style={CustomStyles.infoTextLabel}>Meetup date & time:</Text>
    <Text>{new Date(getTime(jobInfo.meetup_datetime)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
    <Text style={CustomStyles.infoTextLabel}>Meetup location:</Text>
    <Text>{jobInfo.meetup_location}</Text>
    <Text style={CustomStyles.infoTextLabel}>Payment to:</Text>
    <Text>User ID: {jobInfo.seeker_user_id}</Text>
    <TouchableOpacity>
      <Text style={CustomStyles.hyperlinkText}>Think we mistaken? Send a feedback.</Text>
    </TouchableOpacity></>)

  return (
    loading ? null : <View style={CustomStyles.defaultScreenView}>
      <ScrollView style={{ height: '90%' }}>
        <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
        {jobInfo.user_role === 'job_owner'
          ?
          <View>
            <Modal
              visible={visible}
              onRequestClose={() => setVisible(false)}
            >
              <WebView
                source={{ uri: URL }}
                onNavigationStateChange={navigationState => {
                  if (navigationState.url.includes('redirect')) {
                    // TODO: Get API to check if user paid
                    setPaid(true)
                    setVisible(false)
                  }
                }}
              />
            </Modal>
            <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>{`Step 3: Close the job`}</Text>
            <Text style={[CustomStyles.heading6, { marginTop: 10 }]}>Job completion payment</Text>
            <Text style={CustomStyles.text}>Now that the job duration has finished. It is time to pay what the job seeker deserves!</Text>
            <JobSummary />
          </View>
          : <View>
            <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>{`Step 3: Close the job`}</Text>
            <Text style={[CustomStyles.heading6, { marginTop: 10 }]}>Job payment payout</Text>
            <Text style={CustomStyles.text}>Now that the job duration has finished. It is time for Gigverse to work to get you your pay!</Text>
            <JobSummary />
          </View>
        }
      </ScrollView>
      {paid || jobInfo.user_role === 'job_seeker' ?
        <>
          {jobInfo.user_role === 'job_seeker' ?
            <Text style={[CustomStyles.heading6, { marginTop: -40 }]}>Your payout will be on the way. Please wait for our email :D</Text>
            :
            <Text style={[CustomStyles.heading6, { marginTop: -40 }]}>Your payment is completed. An invoice will be sent to your email address soon :D</Text>}
          <BigButton
            label={'Step 4: Rate your experience'}
            customButtonStyling={{ height: '7%' }}
            customLabelStyling={{ fontSize: 17 }}
            onPress={() => {
              navigation.navigate('JobExecutionStepFour', {
                job_id: job_id,
                jobInfo: jobInfo
              })
            }}
            disable={(!paid && !jobInfo.user_role === 'job_seeker')}
          />
        </> :
        <>
          <Text style={[CustomStyles.heading6, { marginTop: -45 }]}>Payment details</Text>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={[CustomStyles.text, { fontSize: 20 }]}>Total</Text>
            <Text style={[CustomStyles.text, { fontSize: 20, justifyContent: 'space-between' }]}>RM {jobPaymentInfo.amount}</Text>
          </View>
          <BigButton
            label={'Pay'}
            customButtonStyling={{ height: '7%' }}
            customLabelStyling={{ fontSize: 17 }}
            onPress={() => setVisible(true)}
          />
        </>}
    </View>
  )
}

export default JobExecutionStepThree