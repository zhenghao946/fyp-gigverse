import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomStyles, { UpcomingJobStatusRender, colors } from '../styles'
import getTime from '../utils/getTime'


const UpcomingJobSummary = ({ dataArray, navigation }) => {
  return (
    dataArray.map((job, index) => {
      return (
        <TouchableOpacity
          key={index}
          style={styles.upcomingJobDetailsContainer}
          onPress={() => { navigation.navigate('UpcomingJobDetails', { job_id: job.job_id }) }}
        >
          <Text style={styles.upcomingJobTitle}>{job.title}</Text>
          <Text style={CustomStyles.infoTextLabel}>RM {job.price}</Text>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Status</Text>
            {UpcomingJobStatusRender(job.job_execution_status)}
          </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Date and Time</Text>
            <Text style={CustomStyles.infoTextContent}>{job.meetup_datetime ? new Date(getTime(job.meetup_datetime)).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) : 'Not decided'}</Text>
          </View>
          <View style={CustomStyles.horizontalContainer}>
            <Text style={CustomStyles.infoTextLabel}>Pickup Location</Text>
            <Text style={CustomStyles.infoTextContent}>{job.meetup_location ? job.meetup_location : 'Not decided'}</Text>
          </View>
        </TouchableOpacity>
      )
    })
  )
}

export default UpcomingJobSummary

const styles = StyleSheet.create({
  upcomingJobDetailsContainer: {
    borderBottomWidth: 1,
    backgroundColor: '#fff'
  },
  upcomingJobTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '500',
    // height: 30,
    marginTop: 5,

  }
})