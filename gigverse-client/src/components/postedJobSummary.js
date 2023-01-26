import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BigButton from './bigButton'
import CustomStyles, { colors } from '../styles'

const PostedJobSummary = ({ dataArray, navigation }) => {
  return (
    dataArray.map((job, index) => {
      return (
        <View
          key={index}
          style={styles.postedJobSummaryContainer}>
          <View style={{ width: '55%', alignSelf: 'center' }}>
            <Text style={styles.postedJobTitle}>{job.title}</Text>
            {job.job_status === 'expired' ? <Text style={CustomStyles.redText}>Job Expired</Text> : null}
            <Text style={styles.postedJobText}>
              {job.applicants} Applicant
              {job.applicants > 1 ? 's' : null}
            </Text>
          </View>
          <BigButton
            customButtonStyling={[styles.customViewButtonStyling, { borderTopRightRadius: 0, borderBottomRightRadius: 0, marginRight: -20 }]}
            customLabelStyling={{ fontSize: 13 }}
            label={'View'}
            onPress={() => { navigation.navigate('ManageJobApplication', { job_id: job.job_id }) }} />
          <BigButton
            customButtonStyling={[styles.customViewButtonStyling, { backgroundColor: 'green', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
            customLabelStyling={{ fontSize: 13 }}
            label={'Edit'}
            onPress={() => { navigation.navigate('EditJob', { job_id: job.job_id }) }} />
        </View>
      )
    })
  )
}

export default PostedJobSummary

const styles = StyleSheet.create({
  postedJobSummaryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postedJobTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '500',
    textAlignVertical: 'center',
    marginTop: 5
  },
  postedJobText: {
    color: 'black',
    fontSize: 16,
    height: 30,
    textAlignVertical: 'center',
  },
  postedJobTextRight: {
    color: 'black',
    position: 'absolute',
    left: 100,
    textAlignVertical: 'center',
    height: 30,
  },
  customViewButtonStyling: {
    height: 35,
    width: '20%',
    marginHorizontal: 1,
    // position: 'absolute',
    // right: 0,
  },
})