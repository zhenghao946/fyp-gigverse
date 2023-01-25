import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../styles'
import BigButton from './bigButton'

const SavedJobSummary = ({ dataArray, navigation }) => {
  return (
    dataArray.map((job, index) => {
      return (
        <View
          key={index}
          style={styles.savedJobSummaryContainer}
        >
          <View style={{ width: '80%' }}>
            <Text style={styles.savedJobTitle}>{job.title}</Text>
            <Text style={styles.savedJobText}>RM {job.price}</Text>
          </View>
          <BigButton
            customButtonStyling={styles.customViewButtonStyling}
            customLabelStyling={{ fontSize: 13 }}
            label={'View'}
            onPress={() => { navigation.navigate('JobDetails', { job_id: job.job_id }) }} />
        </View >
      )
    })
  )
}

export default SavedJobSummary

const styles = StyleSheet.create({
  savedJobSummaryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  savedJobTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '500',
    textAlignVertical: 'center',
    marginTop: 5,
  },
  savedJobText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
    height: 30,
    textAlignVertical: 'center',
  },
  customViewButtonStyling: {
    height: 35,
    width: '20%',
    margin: 0,
    position: 'absolute',
    right: 0
  },
})