import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react'
import DocumentPicker from 'react-native-document-picker'
import CustomStyles from '../styles'
import FormInput from '../components/formInput'
import BigButton from '../components/bigButton'
import MultiLinesInput from '../components/multiLinesInput'
import DropDown from './../components/dropDown'
import { OptionsContext } from '../context/OptionsContext'
import EncryptedStorage from 'react-native-encrypted-storage';
import BASE_URL from './BASE_URL'
import RNFS from 'react-native-fs'
import { BottomSheet } from '@rneui/base'
import { text } from 'body-parser'

const EditProfile = ({ route, navigation }) => {
  const { userInfo } = route.params
  const [updatedUserInfo, setUpdatedUserInfo] = useState(userInfo)
  const [isChanged, setIsChanged] = useState(false)
  const isFirstRender = useRef(true)
  const { field_of_study_options, university_options } = useContext(OptionsContext)
  const [fileResponse, setFileResponse] = useState('')
  const [imageTemp, setImageTemp] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [cardFileResponse, setCardFileResponse] = useState('')
  const [studentCardTemp, setStudentCardTemp] = useState('')
  const [isCardVisible, setIsCardVisible] = useState(false)

  useEffect(() => {
    if (!isFirstRender.current)
      setIsChanged(true)
    isFirstRender.current = false
  }, [updatedUserInfo])

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
    }), [navigation, isChanged]);

  useEffect(() => {
    async function DisplayImage() {
      try {
        if (fileResponse !== '') {
          const data = await RNFS.readFile(fileResponse.uri, 'base64')
          setImageTemp(data)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    DisplayImage()
  }, [fileResponse])

  useEffect(() => {
    async function DisplayStudentCard() {
      try {
        if (cardFileResponse !== '') {
          const data = await RNFS.readFile(cardFileResponse.uri, 'base64')
          setStudentCardTemp(data)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    DisplayStudentCard()
  }, [cardFileResponse])

  const updateProfile = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/user/profile/edit`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          first_name: updatedUserInfo.first_name,
          last_name: updatedUserInfo.last_name,
          email: updatedUserInfo.email,
          phone_num: updatedUserInfo.phone_num,
          address: updatedUserInfo.address,
          field_of_study: updatedUserInfo.field_of_study,
          university: updatedUserInfo.university,
          student_id: updatedUserInfo.student_id,
          // preferred_location: updatedUserInfo.preferred_location
        })
      })
      if (response.status === 200) {
        Alert.alert('User verification submitted', 'Please give our admins a few days to verify you! Meanwhile, you can explore around Gigverse', [
          {
            text: 'Noted!',
            onPress: () => navigation.navigate('Account')
          }
        ])
      } else {
        Alert.alert('Error', await response.text())
      }
    } catch (error) {
      console.log(error)
      Alert.alert(error.message)
    }
  }

  const handleDocumentSelection = async () => {
    try {
      const response = await DocumentPicker.pickSingle({
        presentationStyle: 'fullscreen',
        type: [DocumentPicker.types.images]
      })
      await setFileResponse(response)
      setIsVisible(true)
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const handleStudentCardSelection = async () => {
    try {
      const response = await DocumentPicker.pickSingle({
        presentationStyle: 'fullscreen',
        type: [DocumentPicker.types.images]
      })
      await setCardFileResponse(response)
      setIsCardVisible(true)
    } catch (error) {
      Alert.alert(error.message)
    }
  }

  const uploadProfilePic = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const data = new FormData()
      data.append('image_data', {
        uri: fileResponse.uri,
        name: fileResponse.name,
        type: fileResponse.type,
        size: fileResponse.size
      })
      const response = await fetch(`${BASE_URL}/upload/pic/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        },
        body: data
      })
      if (response.status === 200) {
        Alert.alert('Profile image uploaded')
        navigation.navigate('Account')
        return true
      } else {
        console.log('Not authorized')
        Alert.alert('Not authorized')
        return false
      }
    } catch (error) {
      if (!uploadProfilePic()) {
        console.log(error.message)
      }
    }
  }

  const uploadStudentCard = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const data = new FormData()
      data.append('image_data', {
        uri: cardFileResponse.uri,
        name: cardFileResponse.name,
        type: cardFileResponse.type,
        size: cardFileResponse.size
      })
      const response = await fetch(`${BASE_URL}/upload/pic/studentcard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        },
        body: data
      })
      if (response.status === 200) {
        Alert.alert('Student card uploaded')
        navigation.navigate('Account')
        return true
      } else {
        Alert.alert(await response.text())
        return false
      }
    } catch (error) {
      if (!uploadProfilePic()) {
        console.log(error.message)
      }
    }
  }

  return (
    <View>
      <ScrollView
        style={[CustomStyles.defaultScreenView, { height: isChanged === true ? '88%' : 'auto' }]}
        showsVerticalScrollIndicator={false}
      >
        <BottomSheet isVisible={isVisible} onBackdropPress={() => setIsVisible(!isVisible)}>
          <View style={[CustomStyles.defaultBottomSheet, CustomStyles.imagePreviewBottomSheet]}>
            <Image source={{ uri: `data:image/jpeg;base64, ${imageTemp}` }} style={CustomStyles.fullSizeImage} />
            <BigButton label={'Confirm upload'} onPress={() => uploadProfilePic()} />
          </View>
        </BottomSheet>
        <BottomSheet isVisible={isCardVisible} onBackdropPress={() => setIsCardVisible(!isCardVisible)}>
          <View style={[CustomStyles.defaultBottomSheet, CustomStyles.imagePreviewBottomSheet]}>
            <Image source={{ uri: `data:image/jpeg;base64, ${studentCardTemp}` }} style={CustomStyles.fullSizeImage} />
            <BigButton label={'Confirm upload'} onPress={() => uploadStudentCard()} />
          </View>
        </BottomSheet>

        <View style={CustomStyles.centerView}>
          <Image source={userInfo.profilePic ? { uri: `data:image/jpeg;base64, ${userInfo.profilePic}` } : null} style={CustomStyles.fullSizeImage} />
          <TouchableOpacity onPress={() => { handleDocumentSelection() }}>
            <Text style={CustomStyles.hyperlinkText}>Change profile image</Text>
          </TouchableOpacity>
          <Text style={CustomStyles.heading4}>{userInfo.first_name + ' ' + userInfo.last_name}</Text>
          <Text style={CustomStyles.heading6}>@{userInfo.user_id}</Text>
        </View>
        <Text style={[CustomStyles.text, { marginTop: 20 }]}>To get yourself verified and start using Gigverse to look for jobs. Please fill up the following section with your student identity in UMS.</Text>
        <FormInput
          label={'UMS Student ID'}
          value={updatedUserInfo.student_id}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'student_id'}
          placeholder='BI1911xxxx'
        />
        <Text style={CustomStyles.heading6}>UMS Matric Card Photo</Text>
        <View style={CustomStyles.centerView}>
          <Image source={userInfo.studentCard ? { uri: `data:image/jpeg;base64, ${userInfo.studentCard}` } : null} style={CustomStyles.fullSizeImage} />
          <TouchableOpacity onPress={() => { handleStudentCardSelection() }}>
            <Text style={CustomStyles.hyperlinkText}>Change student card</Text>
          </TouchableOpacity>
        </View>
        <FormInput
          label={'First Name'}
          value={updatedUserInfo.first_name}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'first_name'}
        />
        <FormInput
          label={'Last Name'}
          value={updatedUserInfo.last_name}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'last_name'}
        />
        <FormInput
          label={'Phone Number'}
          value={updatedUserInfo.phone_num}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'phone_num'}
        />
        <FormInput
          label={'Email'}
          value={updatedUserInfo.email}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'email'}
        />
        <MultiLinesInput
          label={'Address'}
          numberOfLines={4}
          value={updatedUserInfo.address}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'address'}
        />
        <DropDown
          label={'Field Of Study'}
          itemArray={field_of_study_options}
          value={updatedUserInfo.field_of_study}
          setValue={setUpdatedUserInfo}
          isMap={true}
          dataMap={updatedUserInfo}
          itemName={'field_of_study'}
        />
        <DropDown
          label={'University'}
          itemArray={university_options}
          value={updatedUserInfo.university}
          setValue={setUpdatedUserInfo}
          isMap={true}
          dataMap={updatedUserInfo}
          itemName={'university'}
        />

        {/* TODO: Implement only if got extra time */}
        {/* <FormInput
          label={'Preferred Location'}
          value={updatedUserInfo.preferred_location}
          isMap={true}
          setText={setUpdatedUserInfo}
          dataMap={updatedUserInfo}
          itemName={'preferred_location'}
        /> */}
      </ScrollView>
      {isChanged === true
        ? <View style={{ height: '10%', justifyContent: 'center' }}>
          <BigButton
            label={'Save Changes'}
            disable={!isChanged}
            onPress={() => {
              if (updatedUserInfo.student_id === null || updatedUserInfo.studentCard === null) {
                Alert.alert('Student identity incomplete', 'Your UMS Student ID and UMS Matric Card is not set yet. Without that, you won\'t be able to use Gigverse. Sure to continue?', [
                  {
                    text: 'Proceed',
                    onPress: () => updateProfile()
                  }
                ])
              } else updateProfile()
              setIsChanged(false)
            }}
          />
        </View>
        : null}
    </View>
  )
}

export default EditProfile