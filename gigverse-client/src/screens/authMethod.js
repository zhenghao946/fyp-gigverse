import { StyleSheet, Text, View, Image, TouchableOpacity, } from 'react-native'
import React from 'react'
import GigverseLogo from './../assets/GigverseLogo.png'
import GoogleLogo from './../assets/GoogleLogo.png'
import BigButton from './../components/bigButton'
import CustomStyles from '../styles'

const AuthMethod = ({ navigation }) => {

  return (
    <View style={CustomStyles.authStackScreen}>
      <View style={{ display: 'flex', marginVertical: 100 }}>
        <Image source={GigverseLogo} style={{ resizeMode: 'contain', height: 200, width: 200 }} />
      </View>
      <Text style={[CustomStyles.heading1]}>Explore | Work | Earn</Text>
      <BigButton
        label={'Login'}
        onPress={() => navigation.navigate('Login')}
      />
      <BigButton
        label={'Register'}
        onPress={() => navigation.navigate('Register')}
      />
      <Text style={CustomStyles.heading3}>Or continue with: </Text>
      <TouchableOpacity>
        <Image source={GoogleLogo} style={styles.googleLogo} />
      </TouchableOpacity>
    </View>
  )
}

export default AuthMethod

const styles = StyleSheet.create({
  logoView: {
    alignItems: 'center',
    marginTop: 20
  },
  googleLogo: {
    marginTop: 10,
    width: 50,
    height: 50,
    resizeMode: 'contain'
  }
})