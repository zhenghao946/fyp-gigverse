import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Tab, TabView } from '@rneui/base'
import BigButton from '../components/bigButton'
import CustomStyles, { colors } from '../styles'
import BASE_URL from './BASE_URL'
import { OptionsContext } from '../context/OptionsContext'
import { AuthContext } from '../context/AuthContext'
import EncryptedStorage from 'react-native-encrypted-storage'
import getTime from '../utils/getTime'
import getUserID from '../utils/getUserID'

const JobDetails = ({ route, navigation }) => {
  const { job_id } = route.params
  const { listOfSkills } = useContext(OptionsContext)
  const { verified } = useContext(AuthContext)
  const [userInfo, setUserInfo] = useState({})
  const [jobInfo, setJobInfo] = useState({})
  const [index, setIndex] = useState(0)
  const [jobSkills, setJobSkills] = useState([])
  const [jobImages, setJobImages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function FetchJobDataByID() {
      try {
        let userToken = await EncryptedStorage.getItem('userToken')
        setUserInfo(getUserID(userToken))
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
            await setJobSkills(json.job_skills)
            await setJobImages(json.job_images)
            navigation.setOptions({ title: `${json.jobInfo.title}` })
            return
          }
        } else Alert.alert('Job not found', 'Job ID: 74 is not a valid job', [
          {
            text: 'Back to Explore',
            onPress: () => navigation.goBack()
          }
        ])
      } catch (error) {
        console.log(error.message)
      }
    }
    setLoading(true)
    FetchJobDataByID()
    setLoading(false)
  }, [])

  currentDate = new Date()
  // jobInfo.application_deadline = new Date(jobInfo.application_deadline)

  const checkJobExpiry = () => {
    // console.log(new Date(convertTimeZone(jobInfo.application_deadline)).toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }))
    // console.log(currentDate.getTime())
    if (getTime(new Date()) > getTime(jobInfo.application_deadline))
      return true
    // if (jobInfo.owner_user_id === userInfo.user_id)
    //   return true
    return false
  }

  const checkUserValidity = () => {
    if (!verified) return false
    if (jobInfo.owner_user_id !== userInfo.user_id) return true
    return false
  }

  const checkJobOverallValidy = () => {
    if (checkJobExpiry() === true) return false
    else if (checkUserValidity() === false) return false
    else return true
  }

  const GetTimeLeft = () => {
    const time = new Date(jobInfo.application_deadline).getTime() - new Date().getTime()
    let result = ''
    const daysLeft = Math.floor(time / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.floor(time % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const minutesLeft = Math.floor(time % (1000 * 60 * 60) / (1000 * 60))

    if (daysLeft > 0) result += `${daysLeft} days `
    else if (daysLeft === 1) result += `${daysLeft} day `

    if (hoursLeft > 0) result += `${hoursLeft} hours `
    else if (hoursLeft === 1) result += `${hoursLeft} hour `

    if (result === '' && minutesLeft > 0) result = 'Left than a minute'
    else if (minutesLeft > 0) result += `${minutesLeft} minutes`
    else if (minutesLeft === 1) result += `${minutesLeft} minute`
    return <Text>{result}</Text>
  }

  return (
    <SafeAreaProvider>
      <View style={{ backgroundColor: colors.primary }}>
        <Tab
          value={index}
          onChange={(e) => setIndex(e)}
          indicatorStyle={styles.tabIndicator}
          variant='primary'
          containerStyle={styles.tabContainer}
        >
          <Tab.Item
            containerStyle={styles.tabItemContainer}
            title={'Details'}
            titleStyle={styles.tabItemTitle}
          />
          <Tab.Item
            containerStyle={styles.tabItemContainer}
            title={'Application'}
            titleStyle={styles.tabItemTitle}
          />
        </Tab>
      </View>
      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={styles.jobDetailsContainer}>
          {loading ? <Text>Loading...</Text> : <ScrollView>
            <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
            <Text style={CustomStyles.heading6}>{jobInfo.price}</Text>
            {checkJobExpiry() === true
              ? <Text style={[CustomStyles.text, { color: 'red' }]}>Job expired!</Text>
              :
              <Text style={CustomStyles.text}>
                Application ends in {'\n'}
                <Text style={[CustomStyles.text, { fontWeight: '500', fontSize: 15 }]}>
                  {GetTimeLeft()}
                </Text>
              </Text>
            }
            <Text style={[CustomStyles.text, { fontSize: 16, marginVertical: 30 }]}>{jobInfo.description}</Text>
            <Text style={CustomStyles.heading6}>Skills Required</Text>
            <View style={styles.jobDetailsTagsContainer}>
              {jobSkills.map((skill, index) => {
                return (<Text key={index} style={styles.jobDetailsTag}>{listOfSkills.find(item => item.skill_category_id === skill.skill_category_id).name}</Text>)
              })}
            </View>
            <Text style={CustomStyles.heading6}>Attachments</Text>
            {jobImages.length > 0 ? <View style={CustomStyles.horizontalContainer}>
              {jobImages.map((image, index) => (
                <Image key={index} source={{ uri: `data:image/jpeg;base64, ${image.uri}` }} style={CustomStyles.profilePicThumbnail} />
              ))}
            </View>
              : null}
            <Text style={CustomStyles.heading6}>Deadline</Text>
            <Text style={[CustomStyles.text, { fontSize: 16 }]}>{new Date(getTime(jobInfo.completion_deadline)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
            <BigButton
              label={'Chat with job owner'}
              customButtonStyling={styles.customButtonStyling}
              customLabelStyling={styles.customLabelStyling}
            />
            <BigButton
              label={'Apply for the job'}
              customButtonStyling={styles.customButtonStyling}
              customLabelStyling={styles.customLabelStyling}
              onPress={() => { navigation.navigate('JobApplication', { job_id: job_id }) }}
              disable={!checkJobOverallValidy()}
            />
            {checkUserValidity() ? null : <Text style={[CustomStyles.text, { textAlign: 'center', marginTop: -10 }]}>(Why? You are either the job owner or not verified)</Text>}
          </ScrollView>}
        </TabView.Item>
        <TabView.Item style={styles.tab}>
          <View>
            <Text>Most likely will not be developed</Text>
          </View>
        </TabView.Item>
      </TabView>
    </SafeAreaProvider >
  )
}

export default JobDetails

const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: colors.primary,
  },
  tabItemContainer: {
    backgroundColor: colors.primary,
  },
  tabIndicator: {
    backgroundColor: '#fff',
  },
  tabItemTitle: {
    fontSize: 14,
  },
  jobDetailsContainer: {
    width: '100%',
    padding: 7,
  },
  jobDetailsTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  jobDetailsTag: {
    backgroundColor: 'black',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 5,
    marginTop: 5,
  },
  customButtonStyling: {
    height: 40,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  customLabelStyling: {
    fontSize: 17,
    fontWeight: 'normal',
  },
  profilePicThumbnail: {
    height: 100,
    width: 80,
    resizeMode: 'contain'
  },
})