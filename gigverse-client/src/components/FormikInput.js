import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Input, Icon } from '@rneui/base'
import CustomStyles from '../styles'

const FormikInput = ({ label, formikProps, value, customContainerStyling, customLabelStyling, customInputStyling, children, password, ...rest }) => {
  const [passwordVisible, setPasswordVisible] = useState(false)
  return (
    <>
      <Input
        label={label}
        onChangeText={formikProps.handleChange(value)}
        onBlur={formikProps.handleBlur(value)}
        value={typeof formikProps.values[value] === 'number' ? formikProps.values[value].toString() : formikProps.values[value]}
        labelStyle={[CustomStyles.heading6, { marginHorizontal: -10, }, customLabelStyling]}
        inputContainerStyle={[styles.inputContainer, customContainerStyling]}
        inputStyle={[{ fontSize: 16 }, customInputStyling]}
        secureTextEntry={password ? (!passwordVisible) : false}
        rightIcon={password ? <Icon name={passwordVisible ? 'eye-with-line' : 'eye'} type='entypo' size={20} onPress={() => setPasswordVisible(!passwordVisible)} /> : null}
        rightIconContainerStyle={{ marginRight: 10, backgroundColor: (passwordVisible ? null : 'grey'), borderRadius: 50, height: '60%', paddingLeft: 4 }}
        {...rest}
      >
      </Input>
      {(formikProps.touched[value] && formikProps.errors[value]) &&
        <Text style={{ color: 'red', fontSize: 14 }}>{formikProps.errors[value]}</Text>
      }
    </>
  )
}
export default FormikInput

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: -10,
    marginBottom: -25,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
    height: 50
    // justifyContent: 'center',
    // alignItems: 'center',
  },
})