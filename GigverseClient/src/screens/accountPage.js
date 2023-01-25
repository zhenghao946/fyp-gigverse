import React, { useState, useEffect, useContext } from 'react'
import { StyleSheet, View, Text, Alert, Image, TouchableOpacity } from 'react-native'
import CustomStyles, { colors } from '../styles';
import { Icon } from '@rneui/base';
import { AuthContext } from '../context/AuthContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import BASE_URL from './BASE_URL.js'
import { useIsFocused } from '@react-navigation/native';

const AccountPage = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({})
  const isFocused = useIsFocused()
  const { logout, verified } = useContext(AuthContext)

  async function getProfile() {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        setUserInfo(json)
      } else {
        console.log(response.status)
        console.log('Not authorized')
        Alert.alert('Not authorized')
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (isFocused)
      getProfile()
  }, [isFocused])

  return (
    <View>
      <View style={[styles.accountInfoContainer, { flexDirection: 'row' }]}>
        <View style={{ marginRight: 10 }}>
          <Image source={userInfo.profilePic ? { uri: `data:image/jpeg;base64, ${userInfo.profilePic}` } : null} style={CustomStyles.profilePicThumbnail} />
        </View>
        <View>
          <Text style={CustomStyles.heading5}>{userInfo.first_name + ' ' + userInfo.last_name}</Text>
          <Text style={CustomStyles.text}>{'@' + userInfo.user_id}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => { navigation.navigate('EditProfile', { userInfo: userInfo }) }}>
              <Text style={CustomStyles.hyperlinkGrey}>Edit profile</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 15 }}> | </Text>
            <TouchableOpacity onPress={() => { navigation.navigate('EditSkill') }}>
              <Text style={CustomStyles.hyperlinkGrey}>Edit skills</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.accountInfoContainer]}>
        {verified ? <><View style={CustomStyles.horizontalContainer}>
          <Text style={CustomStyles.heading6}>Job Seeker Ratings: {userInfo.seeker_ratings} </Text>
          <Icon name='star' type='materials' color={'gold'} containerStyle={{ top: 1 }} />
        </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.heading6}>Job Owner Ratings: {userInfo.owner_ratings} </Text>
            <Icon name='star' type='materials' color={'gold'} containerStyle={{ top: 1 }} />
          </View></> : <Text>No ratings, verifiy yourself first</Text>}
      </View>
      <View style={[[styles.accountInfoContainer, { alignItems: 'flex-start' }]]}>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}><Text style={CustomStyles.heading6}>Notifcations</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}><Text style={CustomStyles.heading6}>Settings</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => { logout() }}><Text style={CustomStyles.heading6}>Logout</Text></TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainview: {
    flex: 1,
    backgroundColor: ''
  },
  titleBar: {
    backgroundColor: colors.secondary,
    height: 46,
    justifyContent: 'center',
  },
  accountInfoContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
});

export default AccountPage;