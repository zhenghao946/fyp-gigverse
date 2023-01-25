import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import DocumentPicker from 'react-native-document-picker'
import CustomStyles from './../styles'
import NormalButton from './../components/normalButton'
import BigButton from './../components/bigButton'
import SkillSelector from '../components/skillSelector'
import { Formik } from 'formik'
import * as yup from 'yup'
import FormikInput from '../components/FormikInput'
import { Icon } from '@rneui/base'
import DateTimePicker from '../components/dateTimePicker'
import FormikMultiLines from '../components/FormikMultiLine'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import BASE_URL from './BASE_URL'
import EncryptedStorage from 'react-native-encrypted-storage';
import Popup from '../utils/popup'
import { AuthContext } from '../context/AuthContext'

const Upload = ({ navigation }) => {
  const [jobSkills, setJobSkills] = useState([])
  const [fileResponse, setFileResponse] = useState([])
  const [valid, setValid] = useState(false)
  const { verified } = useContext(AuthContext)

  const handleDocumentSelection = async () => {
    try {
      const response = await DocumentPicker.pickSingle({
        presentationStyle: 'fullscreen',
      })
      if (response.size > 5000000 || response.size + CalculateFilesTotalSize() > 5000000) {
        Alert.alert("Total files size exceeded 5 MB")
        return
      } else setFileResponse([...fileResponse, response])
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const validationSchema = yup.object().shape({
    jobTitle: yup
      .string()
      .trim()
      .required('Please give your job a title')
      .test('len', 'At least 10 characters', val => val?.length > 10),
    jobDesc: yup
      .string()
      .required('Job description is needed')
      .test('len', 'At least 50 characters', val => val?.length > 10)
      .test('len', 'Cannot more than 300 characters', val => val?.length < 300),
    applicationDeadline: yup
      .date()
      .required('Date is needed'),
    completionDeadline: yup
      .date()
      .transform(function (value, originalValue) {
        if (this.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd.MM.yyyy", new Date());
        return result;
      })
      .min(new Date(), "Date is too early")
      .required('Date is needed'),
    jobRemarks: yup
      .string()
      .nullable(),
    price: yup
      .number()
      .required('Price is needed')
      .min(1, 'Price must be greater of equal to RM 1.00'),
  })

  const CalculateFilesTotalSize = () => {
    let result = 0
    fileResponse.map((file) => {
      result += file.size
    })
    return result
  }

  const uploadJobInfo = async (values) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/owner/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          title: values.jobTitle,
          posted_datetime: new Date().toISOString().replace('T', ' ').split('.')[0],
          price: values.price,
          application_deadline: values.applicationDeadline,
          completion_deadline: values.completionDeadline,
          description: values.jobDesc,
          job_skills: values.jobSkills
        })
      })
      if (response.status === 200) {
        const json = await response.json()
        Popup('Job info uploaded')
        uploadJobImages(json.job_id)
        // setJobInfo(json)
        // Alert.alert('Job upload complete!')
        Popup('Job uploaded successfully')
      } else console.log('Something is wrong')
    } catch (error) {
      console.log(error.message)
    }
  }

  const uploadJobImages = async (job_id) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const data = new FormData()
      fileResponse.map((file) => {
        data.append('image_data', {
          uri: file.uri,
          name: file.name,
          type: file.type,
          size: file.size
        })
      })
      data.append('job_id', job_id)
      const response = await fetch(`${BASE_URL}/upload/files/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        },
        body: data
      })
      if (response.status === 200) {
        // Alert.alert('Job images uploaded')
        Popup('Job images uploaded')
        return true
      } else {
        console.log('Not authorized')
        Alert.alert('Not authorized')
        return false
      }
    } catch (error) {
      console.log(error.message)
    }
  }


  if (!verified)
    return (
      <View style={CustomStyles.centerView}>
        <Text style={CustomStyles.heading6}>Your account is not verified yet.</Text>
        <NormalButton
          label={'Verify now!'}
          onPress={() => navigation.navigate('Account')}
        />
        <Text style={[CustomStyles.text, { textAlign: 'center', marginTop: 10 }]}>(Or log out and log in again if you are sure you are verified.)</Text>
      </View>
    )

  return (
    <SafeAreaProvider>
      <Formik
        initialValues={{
          jobTitle: '',
          jobDesc: '',
          jobSkills: [],
          applicationDeadline: '',
          completionDeadline: '',
          jobRemarks: '',
          price: 0
        }}
        onSubmit={async (values, formikProps) => {
          await uploadJobInfo(values)
          // uploadJobImages(jobInfo.job_id)
          formikProps.resetForm()
          setFileResponse([])
          // setJobInfo({})
        }}
        validationSchema={validationSchema}
      >
        {formikProps => (
          <>
            <ScrollView style={CustomStyles.defaultScreenView} showsVerticalScrollIndicator={false}>
              <Text style={[CustomStyles.heading6, { fontSize: 20 }]}>Tell me what you need done</Text>
              <Text style={[CustomStyles.text, { marginBottom: 10 }]}>Our platform helps you to find the best candidate by requiring simple proposal from
                job seekers everytime they apply for a gig job. </Text>
              <FormikInput
                value='jobTitle'
                label='Title'
                formikProps={formikProps}
                placeholder={'eg: send a document to faculty office'}
              />
              <FormikMultiLines
                value='jobDesc'
                numberOfLines={4}
                label='Description'
                formikProps={formikProps}
                placeholder={'You may include the details needed for the jobs like the pickup and dropoff, knowledge required, job to be performed physically or virtually etc.'}
              />
              <Text style={[CustomStyles.heading6, { marginTop: 10 }]}>Skills needed</Text>
              <Text style={CustomStyles.text}>Choose up to 5 skills related to this job, the system will
                match the job to job seekers that are most interested and have experience in. </Text>
              <SkillSelector
                value='jobSkills'
                formikProps={formikProps}
              />
              <Text style={CustomStyles.heading6}>Documents needed (optional)</Text>
              <Text style={CustomStyles.text}>Upload the resources needed by your candidate to complete
                their job!
                {'\n'}Maximum upload size{'\t\t\t\t\t'}: 5mb
                {'\n'}Maximum number of files{'\t\t\t'}: 5</Text>
              <NormalButton
                disabled={fileResponse.length < 5 ? false : true}
                label={'Upload files'}
                onPress={handleDocumentSelection}
                customButtonStyling={styles.customNormalButton}
              />
              {fileResponse.map((file, index) => {
                return (
                  <View key={index.toString()}>
                    <Text
                      style={{ color: '#000' }}
                      numberOfLines={2}
                      ellipsizeMode={'middle'}>
                      {file.type.includes('pdf') ? <Icon name='file-pdf-box' type='material-community' /> : <Icon name='image' type='material-community' />}
                      {file.name + `    `}
                      {(file.size / 1000000).toFixed(2)}mb
                    </Text>
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 0 }}
                      onPress={() => {
                        setFileResponse(fileResponse.filter((_) => _ != file))
                      }}>
                      <Text style={styles.skillDeleteButtom}>
                        x
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              })}
              <FormikInput
                label='Price (RM)'
                formikProps={formikProps}
                value='price'
                keyboardType='numeric'
              />
              <DateTimePicker
                label={'Application Deadline'}
                formikProps={formikProps}
                value='applicationDeadline'
              ><Icon name='calendar-clock' type='material-community' />
              </DateTimePicker>
              {console.log(formikProps.values.applicationDeadline)}
              <DateTimePicker
                label={'Completion Deadline'}
                formikProps={formikProps}
                value='completionDeadline'
              ><Icon name='calendar-clock' type='material-community' />
              </DateTimePicker>
              <FormikMultiLines
                value='jobRemarks'
                numberOfLines={3}
                label='Special Remarks'
                formikProps={formikProps}
                placeholder={'Anything you wish to add that is not here?'}
              />
            </ScrollView>
            <View style={{ height: '10%', justifyContent: 'center' }}>
              <BigButton
                label={'Confirm Upload'}
                disable={!formikProps.isValid}
                onPress={formikProps.handleSubmit}
              />
            </View>
          </>
        )}
      </Formik>
    </SafeAreaProvider>
  )
}

export default Upload

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
  },
})