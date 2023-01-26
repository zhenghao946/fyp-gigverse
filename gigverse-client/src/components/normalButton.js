import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomStyles from '../styles'

const NormalButton = ({ onPress, label, customButtonStyling, customLabelStyling, disabled, ...rest }) => {
  disabled == true ? buttonOpacity = 0.7 : buttonOpacity = 1
  return (
    <TouchableOpacity
      style={[CustomStyles.normalButton, { width: '25%', opacity: buttonOpacity }, customButtonStyling]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[CustomStyles.normalButtonText, customLabelStyling]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default NormalButton
