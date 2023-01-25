import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import FormInput from './../components/formInput'
import BigButton from './../components/bigButton'
import NormalButton from '../components/normalButton'
import { Icon, BottomSheet, Slider } from '@rneui/base'
import CustomStyles, { colors } from '../styles'
import BASE_URL from './BASE_URL'
import { useIsFocused } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage'
import getTime from '../utils/getTime'

const Explore = ({ navigation }) => {

  const filterAOptions = ['Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Option F',]
  const filterBOptions = ['Physical', 'Virtual', 'Flexible']

  const [location, setLocation] = useState('UMS')
  const [refresh, setRefresh] = useState(0)
  const [savedJobs, setSavedJobs] = useState([])
  const [visible, setVisible] = useState(false)
  const [priceRange, setPriceRange] = useState(50)
  const [filterSelection, setFilterSelection] = useState([])
  const [tempFilterSelection, setTempFilterSelection] = useState([])
  const isFocused = useIsFocused()
  const [jobData, setJobData] = useState([])
  const [lastLoaded, setLastLoaded] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  const FetchSavedJob = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/user/savedjobids`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        setSavedJobs(json.saved_jobs)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const AddSavedJob = async (job_id) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/user/savejob`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          job_id: job_id
        })
      })
      if (response.status === 200) {
        const json = await response.json()
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const RemoveSavedJob = async (job_id) => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/user/removesavejob`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          job_id: job_id
        })
      })
      if (response.status === 200) {
        const json = await response.json()
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const JobSavedIconRender = (id) => {
    for (let i = 0; i < savedJobs.length; i++) {
      if (id === savedJobs[i])
        return <Icon name='bookmark' type='material' size={30} />
    }
    return <Icon name='bookmark-border' type='material' size={30} />
  }

  const HandleSavedJob = async (id) => {
    for (let i = 0; i < savedJobs.length; i++) {
      if (savedJobs[i] === id) {
        await RemoveSavedJob(id)
        savedJobs.splice(i, 1)
        return
      }
    }
    await AddSavedJob(id)
    setSavedJobs([...savedJobs, id])
    return
  }

  const DuplicatedFilter = (dataArray, value) => {
    if (dataArray.length < 0) return false
    for (i = 0; i < dataArray.length; i++) {
      if (dataArray[i] === value) return true
    }
    return false
  }

  const GetTimeLeft = (timestamp) => {
    const time = new Date().getTime() - new Date(getTime(timestamp)).getTime()
    let result = ''
    const daysLeft = Math.floor(time / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.floor(time % (1000 * 60 * 60 * 24) / (1000 * 60 * 60))
    const minutesLeft = Math.floor(time % (1000 * 60 * 60) / (1000 * 60))

    if (daysLeft > 0) result += `${daysLeft} days `
    else if (daysLeft === 1) result += `${daysLeft} day `

    if (hoursLeft > 0) result += `${hoursLeft} hours `
    else if (hoursLeft === 1) result += `${hoursLeft} hour `

    if (daysLeft === 0 && hoursLeft === 0 && minutesLeft > 0) result = 'a minute'
    else if (minutesLeft > 0) result += `${minutesLeft} minutes`
    else if (minutesLeft === 1) result += `${minutesLeft} minute`

    if (result === '') result = 'less than a minute'
    return <Text>{result}</Text>
  }

  async function FetchJobData() {
    try {
      setLastLoaded(jobData.length)
      if (!(lastLoaded === jobData.length) && lastLoaded !== 0) return
      const response = await fetch(`${BASE_URL}/job/view`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 4,
          lastLoaded: lastLoaded
        })
      })
      if (response.status === 200) {
        const json = await response.json()
        if (json.length == 0) {
          return
        }
        else {
          setJobData([...jobData, ...json])
          setLastLoaded(json.length)
          return
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (isFocused) {
      setLoading(true)
      FetchJobData()
      FetchSavedJob()
      setLoading(false)
    }
  }, [isFocused])

  return (
    <SafeAreaProvider>
      <BottomSheet isVisible={visible} onBackdropPress={() => setVisible(!visible)}>
        <ScrollView style={CustomStyles.defaultBottomSheet}>
          <View style={[styles.horizontalContainer, { marginHorizontal: 0, marginBottom: 10 }]}>
            <Text style={CustomStyles.heading5}>Customize your job search</Text>
            <TouchableOpacity style={styles.bottomSheetCloseButton}
              onPress={() => {
                setFilterSelection([])
                setTempFilterSelection([])
                setVisible(!visible)
              }}
            >
              <Text style={CustomStyles.redText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <Text style={CustomStyles.heading5}>Filter A</Text>
          <View style={CustomStyles.horizontalContainer}>
            {filterAOptions.map((option, index) => {
              return <NormalButton
                key={index}
                label={option}
                customLabelStyling={DuplicatedFilter(tempFilterSelection, option) == false ? { color: colors.primary } : null}
                customButtonStyling={[
                  { marginRight: 5, marginVertical: 2 },
                  DuplicatedFilter(tempFilterSelection, option) == false ? { backgroundColor: '#fff', borderWidth: 1 } : null]}
                onPress={() => {
                  DuplicatedFilter(tempFilterSelection, option) == false
                    ? setTempFilterSelection([...tempFilterSelection, option])
                    : setTempFilterSelection(tempFilterSelection.filter((_) => _ != option))
                }}
              />
            })}
          </View>
          <Text style={[CustomStyles.heading5, { marginTop: 15 }]}>Job Execution Mode</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {filterBOptions.map((option, index) => {
              return <NormalButton
                key={index}
                label={option}
                customLabelStyling={DuplicatedFilter(tempFilterSelection, option) == false ? { color: colors.primary } : null}
                customButtonStyling={[
                  { marginRight: 5, marginVertical: 2 },
                  DuplicatedFilter(tempFilterSelection, option) == false ? { backgroundColor: '#fff', borderWidth: 1 } : null]}
                onPress={() => {
                  DuplicatedFilter(tempFilterSelection, option) == false
                    ? setTempFilterSelection([...tempFilterSelection, option])
                    : setTempFilterSelection(tempFilterSelection.filter((_) => _ != option))
                }}
              />
            })}
          </View>
          <Text style={[CustomStyles.heading5, { marginTop: 15 }]}>Price Range</Text>
          <Text>RM 0.00 - RM{priceRange}.00</Text>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            maximumValue={100}
            minimumValue={0}
            step={5}
            thumbTintColor={colors.primary}
            thumbStyle={{ height: 20, width: 20 }}
            // thumbTouchSize={{ width: 40, height: 40 }}
            trackStyle={{ height: 7 }}
          />
          <BigButton label={"Show Jobs"} onPress={() => {
            setFilterSelection([...tempFilterSelection, `RM 0.00 - RM ${priceRange}.00`])
            setVisible(!visible)
          }} />
        </ScrollView>
      </BottomSheet>
      <View style={[CustomStyles.defaultScreenView, { marginTop: 15 }]}>
        <Text style={[CustomStyles.heading5, { marginHorizontal: 5 }]}>Job around {location}</Text>
        <View style={styles.horizontalContainer}>
          <FormInput
            customContainerStyling={styles.searchInputContainer}
            customInputStyling={{ height: 45 }}
            value={searchText}
            placeholder={'Search gig job'}
            setText={setSearchText}
          />
          <NormalButton label={'Search'} customButtonStyling={styles.customSearchButton} />
        </View>
        <View style={styles.jobTagsContainer}>
          <TouchableOpacity style={{ marginRight: 0 }} onPress={() => setVisible(true)}><Icon name='filter' type='material-community' size={35} /></TouchableOpacity>
          {filterSelection.map((selection, index) => {
            return <Text key={index} style={CustomStyles.jobInfoTag}>{selection}</Text>
          })}
        </View>
      </View>
      {loading ? <Text>Loading...</Text>
        : (jobData.length != null ? (
          jobData.length > 0 ? <FlatList
            data={jobData}
            extraData={jobData}
            renderItem={({ item }) => (
              <View style={styles.jobInfoDetailsContainer}>
                <Text style={CustomStyles.heading5}>{item.title}</Text>
                <TouchableOpacity
                  key={refresh}
                  style={styles.saveJobIcon}
                  onPress={async () => {
                    await HandleSavedJob(item.job_id)
                    await setRefresh(refresh + 1)
                  }}
                >
                  {JobSavedIconRender(item.job_id)}
                </TouchableOpacity>
                <Text style={CustomStyles.heading6}>RM {item.price}</Text>
                <Text>Posted {GetTimeLeft(item.posted_datetime)} ago</Text>
                <View style={styles.jobTagsContainer}>
                  {item.skills ?
                    job.job_tags.map((tag, index) => {
                      return (
                        <Text key={index} style={CustomStyles.jobInfoTag}>{tag}</Text>
                      )
                    })
                    : null}
                </View>
                <BigButton
                  label={'View Job'}
                  customButtonStyling={{ width: '100%', marginHorizontal: 0, marginTop: 5, height: 30 }}
                  customLabelStyling={{ fontSize: 15 }}
                  onPress={() => { navigation.navigate('JobDetails', { job_id: item.job_id }) }}
                />
              </View>
            )}
            keyExtractor={(item) => item.job_id}
            onEndReached={() => { FetchJobData() }}
            onEndReachedThreshold={0}
          /> : <Text style={[CustomStyles.text, { textAlign: 'center', fontStyle: 'italic' }]}>Unfortunately, there no available jobs at this time. Consider posting one yourself?</Text>
        )
          : <Text>No jobs found</Text>)}
    </SafeAreaProvider >
  )
}

export default Explore

const styles = StyleSheet.create({
  horizontalContainer: {
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  searchInputContainer: {
    height: 35,
    width: '79.9%',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  jobTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  jobInfoDetailsContainer: {
    backgroundColor: '#fff',
    marginBottom: 5,
    paddingHorizontal: 8,
  },
  saveJobIcon: {
    position: 'absolute',
    right: 2,
    top: 5,
  },
  bottomSheetCloseButton: {
    borderRadius: 20,
    alignContent: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    alignSelf: 'center'
  },
  customSearchButton: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    display: 'flex',
    right: 0,
    marginLeft: 'auto',
  },
})