import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '../styles'

const BigButton = ({ label, onPress, disable, customButtonStyling, customLabelStyling }) => {
  disable == true ? buttonOpacity = 0.7 : buttonOpacity = 1
  return (
    <TouchableOpacity
      style={[styles.authButton, { opacity: buttonOpacity }, customButtonStyling]}
      onPress={onPress}
      disabled={disable}>
      <Text style={[styles.buttonText, customLabelStyling]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default BigButton

const styles = StyleSheet.create({
  authButton: {
    backgroundColor: colors.primary,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    margin: 20,
    // marginHorizontal: 20,
    // marginVertical: 10,
    borderRadius: 10,
    height: 50,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
})