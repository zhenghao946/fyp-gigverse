import { TextInput, View, Text } from 'react-native'
import React from 'react'
import CustomStyles from '../styles'

const FormikMultiLines = ({ numberOfLines, value, formikProps, label = '', customLabelStyling, customInputStyling, ...rest }) => {
  return (
    <View style={{ width: '100%' }}>
      {label !== '' ? <Text style={[CustomStyles.heading6, customLabelStyling]}>{label}</Text> : null}
      <TextInput
        multiline={true}
        numberOfLines={numberOfLines}
        onChangeText={formikProps.handleChange(value)}
        onBlur={formikProps.handleBlur(value)}
        value={formikProps.values[value]}
        style={[CustomStyles.longFormInput, customInputStyling]}
        {...rest}
      />
      {(formikProps.touched[value] && formikProps.errors[value]) &&
        <Text style={{ color: 'red', fontSize: 15 }}>{formikProps.errors[value]}</Text>
      }
    </View>
  )
}

export default FormikMultiLines

