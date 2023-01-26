import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import GigverseLogo from './../assets/GigverseLogo.png'
import { Icon } from '@rneui/base'

const ChatMessage = ({ message, componentType, user_name }) => {
  const timestamp = new Date(message.sent_datetime).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })
  if (componentType === 'AccountOwner') {
    return (
      <View style={[styles.horizontalContainer, { alignSelf: 'flex-end' }]}>
        <Text style={styles.messageContent}>{message.text}</Text>
        <Text style={{ textAlign: 'right' }}>Sent at {timestamp}
          {/* TODO: if got time add in read or not read feature */}
          {/* {message.isRead == true ? <Icon name='check-all' type='material-community' style={{ top: 5, opacity: 0.5 }} /> : <Icon name='check' style={{ top: 5, opacity: 0.7 }} />} */}
        </Text>
      </View>
    )
  }
  else if (componentType === 'Unsend')
    return (
      <View style={[styles.horizontalContainer, { alignSelf: 'flex-end' }]}>
        <Text style={styles.messageContent}>{message.text}</Text>
      </View>
    )
  else if (componentType === 'NotAccountOwner')
    return (
      <View style={styles.chatMessageContainer}>
        <Image source={GigverseLogo} style={{ width: 60, height: 60 }} />
        <View style={styles.horizontalContainer}>
          <Text style={styles.messageOwner}>{user_name || 'unknown'}</Text>
          <Text style={styles.messageContent}>{message.text}</Text>
          <Text style={{ textAlign: 'right' }}>Sent at {new Date(message.sent_datetime).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}</Text>
        </View>
      </View >
    )
  else return
}

export default ChatMessage

const styles = StyleSheet.create({
  chatMessageContainer: {
    flexDirection: 'row',
    margin: 5,
    alignItems: 'flex-end'
  },
  horizontalContainer: {
    borderRadius: 10,
    backgroundColor: '#fff',
    borderColor: 'grey',
    borderWidth: 1,
    width: '70%',
    marginLeft: 10,
    marginRight: 5,
    padding: 10
  },
  messageOwner: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 17
  },
  messageContent: {
    color: '#000',
    fontSize: 15
  },
})