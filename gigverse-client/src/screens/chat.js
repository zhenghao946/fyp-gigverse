import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import GigverseLogo from './../assets/GigverseLogo.png'
import CustomStyles from '../styles'
import EncryptedStorage from 'react-native-encrypted-storage';
import BASE_URL from './BASE_URL';

const Chat = ({ navigation }) => {

  const [chats, setChats] = useState([])

  const getChats = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/chatting/getchats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        setChats(json)
      } else console.log('haha')
    } catch (error) {

    }
  }

  useEffect(() => {
    getChats()
  }, [])


  return (
    <View>
      {chats.length > 0 ? chats.map((chat, index) => {
        return (
          <TouchableOpacity
            key={index}
            style={styles.chatContainer}
            onPress={() => navigation.navigate('ChatDetails', {
              user_id: chat.user_id,
              // user_name: chat.user_name,
              // user_pic: chat.user_pic
            })}
          >
            <Image source={chat.user_pic || GigverseLogo} style={CustomStyles.chatProfilePicThumbnail} />
            <View style={{ alignSelf: 'center', marginHorizontal: 10 }}>
              <Text style={CustomStyles.heading6}>{chat.user_name || 'User name not found'}</Text>
              <Text>{chat.text}</Text>
            </View>
          </TouchableOpacity>
        )
      }) : <Text style={[CustomStyles.text, { textAlign: 'center', fontStyle: 'italic' }]}>Wow such emptiness :'D</Text>}
    </View>
  )
}

export default Chat

const styles = StyleSheet.create({
  chatContainer: {
    borderWidth: 1,
    flexDirection: 'row',
    padding: 10,
  },
})