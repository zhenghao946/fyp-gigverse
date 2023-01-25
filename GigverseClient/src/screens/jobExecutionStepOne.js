import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomStyles from '../styles'
import BigButton from '../components/bigButton'
import { Input } from '@rneui/base'
import NormalButton from '../components/normalButton'
import BASE_URL from './BASE_URL'
import EncryptedStorage from 'react-native-encrypted-storage'
import socket from '../utils/socket'

const JobExecutionStepOne = ({ route, navigation }) => {
  const { job_id, jobInfo } = route.params
  const [userUniqueCode, setUserUniqueCode] = useState(null)
  const [uniqueCode, setUniqueCode] = useState({
    1: 1,
    2: 2,
    3: 3,
    4: 4,
  })
  const [verified, setVerified] = useState(false)

  const GetUniqueCode = async () => {
    if (userUniqueCode === null) {
      try {
        let userToken = await EncryptedStorage.getItem('userToken')
        const response = await fetch(`${BASE_URL}/job/execute/getuniquecode`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        })
        if (response.status === 200) {
          const json = await response.json()
          setUserUniqueCode(json.unique_code)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
  }

  const VerifiyUniqueCode = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const unique_code = Object.values(uniqueCode).join('')
      const response = await fetch(`${BASE_URL}/job/execute/verifyuniquecode`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          user_id: (jobInfo.user_role === 'job_seeker' ? jobInfo.owner_user_id : jobInfo.seeker_user_id),
          unique_code: `${unique_code}`
        })
      })
      if (response.status !== 200) {
        // TODO: Strictly for debugging purpose only!
        return setVerified(true)
      }
      return setVerified(true)
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    GetUniqueCode()
  }, [])

  useEffect(() => {
    socket.on('countdown_begin', (data) => {
      return (Alert.alert('Job duration', 'Job duration will start to countdown. The duration will start when either of you click \'ok\' and the end time will follow the one who started earlier', [
        {
          text: 'ok',
          onPress: () => navigation.navigate('JobExecutionStepTwo', { job_id: job_id, jobInfo: jobInfo })
        },
        {
          text: 'No',
          onPress: () => { }
        }
      ]))
    })
  }, [socket])

  return (
    <View style={CustomStyles.defaultScreenView}>
      <ScrollView style={{ height: '90%' }}>
        <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
        <View style={{ alignSelf: 'center', marginTop: 10 }}>
          <Text style={[CustomStyles.heading6, { textAlign: 'center' }]}>{`Step 1: Meet up with job owner/seeker`}</Text>
          <Text style={[CustomStyles.text, { textAlign: 'center', marginTop: 10 }]}>Your unique code is: </Text>
          <Text style={[CustomStyles.heading4, { fontSize: 80, textAlign: 'center' }]}>{userUniqueCode}</Text>
          <Text style={{ textAlign: 'justify' }}>{`Match this code with your job ${jobInfo.user_role === 'job_owner' ? 'job seeker' : 'job owner'} and acquire the unique code from them. Then, key in their code down below to verify meet up between the both of you.`}</Text>
        </View>
        <View style={[CustomStyles.horizontalContainer, CustomStyles.defaultScreenView, { marginHorizontal: '8%' }]}>
          {Array(4).fill().map((value, index) => (
            <View
              key={index}
              style={{ flex: 1 / 4 }}
            >
              <Input
                maxLength={1}
                inputContainerStyle={{
                  marginHorizontal: -5,
                  marginBottom: -25,
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignItems: 'stretch'
                }}
                inputStyle={{ textAlign: 'center' }}
                keyboardType={'number-pad'}
                value={String(uniqueCode[index + 1]) === '0' ? null : String(uniqueCode[index + 1])}
                onChangeText={(text) => {
                  setUniqueCode({ ...uniqueCode, [index + 1]: Number(text) })
                  // console.log({ ...uniqueCode, [index + 1]: Number(text) })
                }}
                // TODO: Make cursor points backwards or forward
                // onKeyPress={(e) => {
                //   if (e.nativeEvent.key === 'Backspace') console.log('haha')
                //   else {

                //   }
                // }}
                key={index}
              />
            </View>
          ))}
        </View>
        <NormalButton
          label={'Verify'}
          customButtonStyling={{ alignSelf: 'center' }}
          onPress={() => VerifiyUniqueCode()}
        />
        {verified ? <Text>Verified</Text> : <Text>Not verified</Text>}
      </ScrollView>
      <BigButton
        label={'Step 2: Begin the job duration count'}
        customButtonStyling={{ height: '7%' }}
        customLabelStyling={{ fontSize: 17 }}
        onPress={() => {
          // TODO: Add alert to ensure user ready to countdown
          socket.emit('countdown_confirmation', { job_id: job_id, duration: jobInfo.duration })
        }}
        disable={!verified}
      />
    </View>
  )
}

export default JobExecutionStepOne

const styles = StyleSheet.create({})