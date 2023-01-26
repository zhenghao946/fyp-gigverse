import { StyleSheet, Text, View, ScrollView, Alert, TextInput } from 'react-native'
import React, { useState } from 'react'
import CustomStyles, { colors } from '../styles'
import BigButton from '../components/bigButton'
import StarRating from 'react-native-star-rating-widget';
import EncryptedStorage from 'react-native-encrypted-storage'
import BASE_URL from './BASE_URL';

const JobExecutionStepFour = ({ route, navigation }) => {

  const [rating, setRating] = useState(0.5)
  const { job_id, jobInfo } = route.params
  const [comment, setComment] = useState('')

  // TODO: Only let 1 job and 1 type of role has 1 review, if user does not invovle in job cnt review
  const ReviewJob = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      const response = await fetch(`${BASE_URL}/job/execute/submitreview`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          job_id: job_id,
          user_type: jobInfo.user_role,
          comment: comment,
          ratings: rating
        })
      })
      if (response.status === 200) {
        Alert.alert('Congratulations, you have finished your job!')
        navigation.navigate('Home')
      } else Alert.alert('Something went wrong with sending your review. Try again')
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <View style={CustomStyles.defaultScreenView}>
      <ScrollView style={{ height: '90%' }}>
        <Text style={[CustomStyles.heading5, { borderBottomWidth: 1 }]}>{jobInfo.title}</Text>
        <Text style={[CustomStyles.text, { marginTop: 10 }]}>Good job! The gig job is now successfully ended!</Text>
        <Text style={CustomStyles.text}>Kindly provide your feedback</Text>
        <View style={{ marginTop: 30 }}>
          <Text style={[CustomStyles.heading4, { fontSize: 20 }]}>Feedback</Text>
          <StarRating
            rating={rating}
            onChange={value => setRating(value)}
            emptyColor={'grey'}
            color={colors.secondary}
            starSize={40}
            minRating={0.5}
          />
          <Text style={[CustomStyles.heading6, { fontSize: 17 }]}>Ratings: {rating}/5</Text>
          <Text style={[CustomStyles.heading4, { fontSize: 20, marginTop: 20 }]}>Comment</Text>
          <TextInput
            value={comment}
            multiline={true}
            numberOfLines={4}
            style={CustomStyles.longFormInput}
            placeholder={'The service was good!'}
            onChangeText={text => setComment(text)}
          />
        </View>
      </ScrollView>
      <BigButton
        label={'Complete!'}
        customButtonStyling={{ height: '7%' }}
        customLabelStyling={{ fontSize: 17 }}
        onPress={() => {
          ReviewJob()
        }}
      />
    </View>
  )
}

export default JobExecutionStepFour

const styles = StyleSheet.create({})