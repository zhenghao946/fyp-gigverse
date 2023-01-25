import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import FormInput from '../components/formInput'
import NormalButton from '../components/normalButton'
import { Icon } from '@rneui/base'
import ChatMessage from '../components/chatMessage'
import getTime from '../utils/getTime'
import { GiftedChat } from 'react-native-gifted-chat'
import EncryptedStorage from 'react-native-encrypted-storage';
import BASE_URL from './BASE_URL'
// socket attempt (failed)
import { io, Socket } from 'socket.io-client'
import { useSocket } from '../hooks/useSocket'
import getUserID from '../utils/getUserID'


const ChatDetails = ({ route, navigation }) => {
  const { user_id, user_name, user_pic } = route.params
  const scrollViewRef = useRef()
  const [userInfo, setUserInfo] = useState({})
  const [message, setMessage] = useState('')
  const [unsend, setUnsend] = useState([])
  const [chat, setChat] = useState([])

  const getUserInfo = async () => {
    let userToken = await EncryptedStorage.getItem('userToken')
    setUserInfo(getUserID(userToken))
  }

  useEffect(() => {
    getUserInfo()
    console.log(userInfo.user_id)
    console.log(user_id)
    setChat([
      {
        _id: userInfo.user_id,
        text: 'Hello gigverse',
        createdAt: new Date(getTime(new Date())),
        user: {
          _id: user_id,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
  }, [])

  onReceive = (text) => {
    console.log('receiver: ' + userInfo.user_id)
    setChat((previousState) => {
      return {
        messages: GiftedChat.append(
          previousState,
          [
            {
              _id: user_id,
              text,
              createdAt: new Date(getTime(new Date())),
              user: userInfo.user_id,
            },
          ],
          Platform.OS !== 'web',
        ),
      }
    })
  }

  const onSend = useCallback((messages = []) => {
    console.log(userInfo.user_id)
    return setChat(previousMessages => GiftedChat.append(previousMessages, messages))
  }, [])

  return (
    // <View>
    //   <ScrollView
    //     ref={scrollViewRef}
    //     onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
    //     style={{ marginTop: 5, height: '90%' }}
    //   >
    //     {chat.map((message, index) => {
    //       return (
    //         message.sender_user_id === user_id
    //           ? <ChatMessage key={index} componentType={'NotAccountOwner'} message={message} user_name={user_name} />
    //           : <ChatMessage key={index} componentType={'AccountOwner'} message={message} />
    //       )
    //     })}
    //     {unsend.length > 0
    //       ? unsend.map((message, index) => { return <ChatMessage key={index} componentType={'Unsend'} message={message} /> })
    //       : null
    //     }

    //   </ScrollView>
    //   <View style={styles.textingContainer}>
    //     <TouchableOpacity>
    //       <Icon name='attachment' type='material' size={35} style={styles.messageStatus} />
    //     </TouchableOpacity>
    //     <FormInput
    //       customContainerStyling={styles.messageInput}
    //       value={message}
    //       setText={setMessage}
    //       placeholder={'Message...'}
    //     />
    //     <NormalButton
    //       label={'Send'}
    //       onPress={() => { }}
    //       customButtonStyling={styles.sendButton}
    //     />
    //   </View> 
    // </View>
    <GiftedChat
      messages={chat}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: userInfo.user_id,
      }}
      onQuickReply={(message) => onReceive(message)}
    />
  )
}

export default ChatDetails

const styles = StyleSheet.create({
  messageInput: {
    alignSelf: 'center',
    width: '80%',
    alignSelf: 'auto',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  sendButton: {
    width: '18%',
    height: 51,
    display: 'flex',
    right: 0,
    marginLeft: 'auto',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  textingContainer: {
    backgroundColor: '#fff',
    height: '10%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5
  },
  messageStatus: {
    marginHorizontal: -5,
    transform: [{ rotate: '90deg' }]
  }
})