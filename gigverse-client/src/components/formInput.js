import { StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Input, Icon } from '@rneui/base'
import CustomStyles from '../styles'

const FormInput = ({ label, setText, value, placeholder, secureTextEntry = false, autoCapitalize = 'none', disable = false, password, customContainerStyling, customLabelStyling, customInputStyling, isMap = false, dataMap, itemName }) => {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <Input
      label={label}
      labelStyle={[CustomStyles.heading6, { marginHorizontal: -10 }, customLabelStyling]}
      inputContainerStyle={[styles.inputContainer, customContainerStyling]}
      inputStyle={[{ fontSize: 16 }, customInputStyling]}
      onChangeText={(text) =>
        isMap === false ? setText(text)
          : setText({ ...dataMap, [itemName]: text })
      }
      value={value}
      secureTextEntry={password ? (!passwordVisible) : false}
      placeholder={placeholder}
      autoCapitalize={autoCapitalize}
      disabled={disable}
      rightIcon={password ? <Icon name={passwordVisible ? 'eye-with-line' : 'eye'} type='entypo' size={20} onPress={() => setPasswordVisible(!passwordVisible)} /> : null}
      rightIconContainerStyle={{ marginRight: 10, backgroundColor: (passwordVisible ? null : 'grey'), borderRadius: 50, height: '60%', paddingLeft: 4 }}
    />
  )
}

export default FormInput

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: -10,
    marginBottom: -25,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50
  },
})