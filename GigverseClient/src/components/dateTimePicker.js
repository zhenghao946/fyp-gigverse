import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Icon } from '@rneui/base'
import DatePicker from 'react-native-date-picker'
import CustomStyles from '../styles'
import getTime from '../utils/getTime'

const DateTimePicker = ({ label, formikProps, value, customLabelStyling, customContainerStyling, children }) => {

  const date = new Date()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Text style={[CustomStyles.heading6, customLabelStyling]}>{label}</Text>
      <View style={[styles.dateTimeContainer, customContainerStyling]}>
        {/* <Text style={{ color: '#000', fontSize: 15 }}>{formikProps.values[value]?.split('.')[0].replace('T', ' ') || 'Not set'}</Text> */}
        <Text style={{ color: '#000', fontSize: 15 }}>{new Date(getTime(formikProps.values[value])).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) || 'Not set'}</Text>
        <TouchableOpacity onPress={() => setOpen(true)} style={{ alignSelf: 'center', position: 'absolute', right: 10 }}>
          {children}
          {/* TODO: Remove Icon component, making button appearance customizable using children props */}

          <DatePicker
            modal
            date={date}
            open={open}
            mode={'time'}
            onConfirm={(newDate) => {
              setOpen(false)
              formikProps.setFieldValue(value, (formikProps.values[value] + ' ' + newDate.toTimeString().split(' ')[0]))
            }}
            value={formikProps.values[value]}
            onCancel={() => {
              setOpen(false)
            }}
          />
          <DatePicker
            modal
            date={date}
            open={open}
            mode={'date'}
            onConfirm={(newDate) => {
              setOpen(false)
              formikProps.setFieldValue(value, newDate.toISOString().split('T')[0])
            }}
            value={formikProps.values[value]}
            onCancel={() => {
              setOpen(false)
            }}
          />
        </TouchableOpacity>
      </View>
    </>
  )
}

export default DateTimePicker

const styles = StyleSheet.create({
  dateTimeContainer: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center'
  },
})