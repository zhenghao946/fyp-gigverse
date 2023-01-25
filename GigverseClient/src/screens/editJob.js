import { Image, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import CustomStyles from '../styles'
import BigButton from '../components/bigButton'
import { Formik, useFormikContext } from 'formik'
import FormikInput from '../components/FormikInput'
import FormikMultiLine from '../components/FormikMultiLine'
import SkillSelector from '../components/skillSelector'
import DateTimePicker from '../components/dateTimePicker'
import NormalButton from '../components/normalButton'
import DocumentPicker from 'react-native-document-picker'
import { Icon } from '@rneui/base'
import EncryptedStorage from 'react-native-encrypted-storage'

const EditJob = ({ route, navigation }) => {
  const { job_id } = route.params
  const [updatedJobInfo, setUpdatedJobInfo] = useState([])
  const [jobSkills, setJobSkills] = useState([])
  const [jobFiles, setJobFiles] = useState([])
  const [isChanged, setIsChanged] = useState(false)
  const [loading, setLoading] = useState(false)
  const isFirstRender = useRef(true)
  const [fileResponse, setFileResponse] = useState([])
  const [submitted, setSubmitted] = useState(false)

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

  const CalculateFilesTotalSize = () => {
    let result = 0
    fileResponse.map((file) => {
      result += file.size
    })
    return result
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
            await setUpdatedJobInfo(json.jobInfo)
            await setJobSkills(json.job_skills.map((skill) => (skill.skill_category_id)))
            await setJobFiles(json.job_images)
            return isFirstRender.current = false
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
      )
    }), [navigation, isChanged]);

  const updateJob = async (values) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/owner/edit`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          job_id: values.job_id,
          title: values.title,
          price: values.price,
          description: values.description,
          application_deadline: values.application_deadline,
          completion_deadline: values.completion_deadline,
          job_skills: values.job_skills
        })
      })
      if (response.status === 200) {
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const updateJobFiles = async (values) => {
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
      data.append('job_id', values.job_id)
      if (values.job_files.length > 0) {
        values.job_files.map((file) => {
          data.append('old_files[]', file.original_name)
        })
      } else data.append('old_files[]', [])

      const response = await fetch(`${BASE_URL}/upload/files/job/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        },
        body: data
      })
      if (response.status === 200) {
        Alert.alert('Job images uploaded')
        return true
      } else if (response.status === 204) {
        Alert.alert('No new files')
      } else {
        console.log('Not authorized')
        Alert.alert('Not authorized')
        return false
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const deleteJob = async (job_id) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/owner/delete/${job_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        Alert.alert('Job deleted!')
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

  return (
    <View style={CustomStyles.defaultScreenView}>
      <Formik
        enableReinitialize={true}
        initialValues={{ ...updatedJobInfo, job_skills: jobSkills, job_files: jobFiles }}
        onSubmit={async (values) => {
          updateJob(values)
          updateJobFiles(values)
          await setSubmitted(true)
          await setIsChanged(false)
          Alert.alert('Job updated!')
          navigation.navigate('TabNavigator')
        }}
      >
        {formikProps => (
          <View>
            <ScrollView style={{ height: isChanged === true ? '90%' : '100%' }}>
              {!isFirstRender.current && !submitted ? <FormObserver /> : null}
              <FormikInput
                label='Job Title'
                formikProps={formikProps}
                value='title'
              />
              <FormikInput
                label='Price'
                formikProps={formikProps}
                value='price'
              />
              <FormikMultiLine
                label='Job Description'
                numberOfLines={4}
                formikProps={formikProps}
                value='description'
              />
              <Text style={CustomStyles.heading6}>Job Skills</Text>
              <SkillSelector
                formikProps={formikProps}
                value='job_skills'
              />
              <Text style={CustomStyles.heading6}>Attachments</Text>
              <View>
                {formikProps.values.job_files.length > 0 ? formikProps.values.job_files.map((file, index) => (
                  <View key={index}>
                    {/* <Image source={{ uri: `data:image/jpeg;base64, ${file.uri}` }} style={CustomStyles.profilePicThumbnail} /> */}
                    <Text
                      style={{ color: '#000' }}
                      numberOfLines={2}
                      ellipsizeMode={'middle'}>
                      {file.file_type !== 'image/jpeg' && file.file_type !== 'image/png' ? <Icon name='file-pdf-box' type='material-community' /> : <Icon name='image' type='material-community' />}
                      {file.original_name + `    `}
                      {(parseInt(file.size) / 1000000).toFixed(2)}mb
                    </Text>
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 0 }}
                      onPress={() => {
                        // setFileResponse(formikProps.values.job_files.filter((_) => _ != file))
                        formikProps.setFieldValue('job_files', formikProps.values.job_files.filter((_) => _ != file))
                      }}>
                      <Text style={styles.skillDeleteButtom}>
                        x
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
                  : <Text>No files</Text>}
              </View>
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
              <DateTimePicker
                label='Job Application Deadline'
                customLabelStyling={CustomStyles.heading6}
                value='application_deadline'
                formikProps={formikProps}
              >
                <Icon name='calendar-clock' type='material-community' />
              </DateTimePicker>
              <DateTimePicker
                label='Job Completion Deadline'
                customLabelStyling={CustomStyles.heading6}
                value='completion_deadline'
                formikProps={formikProps}
              ><Icon name='calendar-clock' type='material-community' />
              </DateTimePicker>
              <NormalButton
                label={'Delete Job'}
                customButtonStyling={{ backgroundColor: 'red', width: 'auto', margin: 10 }}
                onPress={async () => {
                  deleteJob(formikProps.values.job_id)
                  await setSubmitted(true)
                  await setIsChanged(false)
                  Alert.alert('Job deleted!')
                  navigation.navigate('TabNavigator')
                }}
              />
            </ScrollView>
            {isChanged === true
              ? <View style={{ height: '10%', justifyContent: 'center' }}>
                <BigButton
                  label={'Save Changes'}
                  disable={!isChanged}
                  onPress={formikProps.handleSubmit}
                />
              </View>
              : null}
          </View>
        )}
      </Formik>
    </View>
  )
}

export default EditJob

const styles = StyleSheet.create({})