import { View, StyleSheet, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomStyles from '../styles'
import BigButton from '../components/bigButton'
import { Overlay } from '@rneui/base'
import { Formik, useFormikContext } from 'formik'
import FormikMultiLines from '../components/FormikMultiLine'
import FormikDropDown from '../components/FormikDropDown'
import * as yup from 'yup'
import EncryptedStorage from 'react-native-encrypted-storage';
import BASE_URL from './BASE_URL'
import socket from '../utils/socket'

const JobApplication = ({ route, navigation }) => {
  const { job_id } = route.params
  const [visible, setVisible] = useState(false)
  const [jobInfo, setJobInfo] = useState([])
  const [bidOption, setBidOption] = useState(0)
  const [totalPrice, setTotalPrice] = useState(undefined)
  const [loading, setLoading] = useState(false)

  const price_bid_option = [3.00, 5.00, 10.00]

  useEffect(() => {
    async function FetchJobDataByID() {
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
            await setTotalPrice(parseFloat(json.jobInfo.price))
            d = new Date()
            d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000)
            jobDate = new Date(json.jobInfo.application_deadline)
            jobDate.setTime(jobDate.getTime() - jobDate.getTimezoneOffset() * 60 * 1000)
            if (d.getTime() > jobDate.getTime()) {
              setVisible(true)
            }
            return
          }
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    setLoading(true)
    FetchJobDataByID()
    setLoading(false)
  }, [])

  const PriceObserver = () => {
    const { values } = useFormikContext()
    useEffect(() => {
      values.bid_option > 0 ? setTotalPrice(parseFloat(jobInfo.price) + values.bid_option) : setTotalPrice(parseFloat(jobInfo.price))
    }, [values])
    return null
  }

  const validationSchema = yup.object().shape({
    description: yup
      .string()
      .min(20, 'At least 20 characters')
      .required('Description of solution is required'),
    bid_option: yup
      .number(),
    remarks: yup
      .string()
      .nullable()
  })

  const applyJob = async (values) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/seeker/applyjob`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          job_id: job_id,
          price_bid: totalPrice,
          description: values.description,
          remarks: values.remarks
        })
      })
      if (response.status === 200) {
        Alert.alert('Job applied! Wait for good news')
        navigation.navigate("TabNavigator")
        socket.emit('job_application', { userToken: userToken })
      } else {
        Alert.alert(await response.text())
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <View style={CustomStyles.defaultScreenView}>
      <Overlay isVisible={visible} overlayStyle={styles.overlayContainer} collapsable={false}>
        <Text style={styles.overlayText}>
          Unfortunately, the job has expired at: {jobInfo.application_deadline}
          {'\n\n'}Please look for another job
        </Text>
        <BigButton
          label={'Back to explore page'}
          customButtonStyling={{ marginBottom: 0 }}
          customLabelStyling={{ fontSize: 20 }}
          onPress={() => { navigation.navigate('Explore') }}
        />
      </Overlay>
      <Formik
        enableReinitialize={true}
        initialValues={{
          description: '',
          bid_option: undefined,
          remarks: ''
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          applyJob(values)

        }}
      >
        {formikProps => (
          <View>
            <PriceObserver />
            <Text style={CustomStyles.heading5}>Apply for you gig job</Text>
            <Text style={CustomStyles.text}>Our platform accept multiple job applications and the decision
              is up to the job owner, so you stand a better and fair chance!</Text>
            <FormikMultiLines
              label='Description of Solutions'
              formikProps={formikProps}
              value='description'
              numberOfLines={4}
              placeholder={'You may briefly explain your approach to complete th job given. \nEg: 2 mentoring sessions in total or available 24 hours, comfortable and clean car, able to complete job within 2 hours etc.'}
            />
            <FormikDropDown
              label={'Bid for higher pay (optional)'}
              itemArray={[...price_bid_option, 'No Bidding']}
              defaultValue={'Choose your bid option'}
              value='bid_option'
              formikProps={formikProps}
            />
            <Text>Total Price: RM {totalPrice}</Text>
            <FormikMultiLines
              label='Special Remarks'
              formikProps={formikProps}
              value='remarks'
              numberOfLines={3}
              placeholder={'Anything you wish to add that is not here?'}
            />
            <BigButton
              label={'Submit'}
              disable={!formikProps.isValid}
              onPress={formikProps.handleSubmit}
            />
          </View>
        )}
      </Formik>
    </View>
  )
}

export default JobApplication

const styles = StyleSheet.create({
  overlayContainer: {
    backgroundColor: '#fff',
    width: '80%',
    height: '30%',
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