import { Text, View, Image } from 'react-native'
import React from 'react'
import GigverseLogo from './../assets/GigverseLogo.png'
import BigButton from '../components/bigButton'
import CustomStyles from '../styles'

const Startup = ({ navigation }) => {
  return (
    <View style={CustomStyles.authStackScreen}>
      <View style={{ marginVertical: 150 }}>
        <Image source={GigverseLogo} style={{ resizeMode: 'contain', height: 200, width: 200 }} />
      </View>
      <Text style={[CustomStyles.heading1, { marginBottom: 20 }]}>Do you want to get access to convenient and eays jobs?</Text>
      <Text style={[CustomStyles.heading2, { marginBottom: 50 }]}>We can help you achieve it!</Text>
      <BigButton
        label={'Get Started!'}
        onPress={() => { navigation.navigate('AuthMethod') }}
      />

    </View >
  )
}

export default Startup