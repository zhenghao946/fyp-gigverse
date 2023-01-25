import { StyleSheet, TextInput, View, Text } from 'react-native'
import React from 'react'
import CustomStyles from '../styles'

const MultiLinesInput = ({ numberOfLines, value, setText, placeholder, label = '', customLabelStyling, customInputStyling, isMap = false, dataMap, itemName }) => {
  return (
    <View style={{ width: '100%' }}>
      {label !== '' ? <Text style={[CustomStyles.heading6, customLabelStyling]}>{label}</Text> : null}
      <TextInput
        multiline={true}
        numberOfLines={numberOfLines}
        onChangeText={(text) =>
          isMap === false ? setText(text)
            : setText({ ...dataMap, [itemName]: text })
        }
        value={value}
        style={[CustomStyles.longFormInput, customInputStyling]}
      />
    </View>
  )
}

export default MultiLinesInput

const styles = StyleSheet.create({
  inputLabel: {
    color: "black",
    fontSize: 20,
    fontWeight: 'bold'
  },
  longFormInput: {
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    fontSize: 12,
    paddingHorizontal: 5
  },
})
