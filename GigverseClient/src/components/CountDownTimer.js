import React from 'react'
import { useCountDown } from '../hooks/useCountDown'
import CustomStyles from '../styles'
import { View, Text } from 'react-native'

const DateTimeDisplay = ({ value, type, isDanger }) => {
  return (
    <View style={{ flex: 1 / 4, alignSelf: 'center' }}>
      <Text style={[CustomStyles.heading4, { textAlign: 'center' }]}>{value}</Text>
      <Text style={{ textAlign: 'center' }}>{type}</Text>
    </View>
  )
}

const CountDownDisplay = ({ days, hours, minutes, seconds }) => {
  return (
    <View style={[CustomStyles.horizontalContainer]}>
      <DateTimeDisplay
        value={days}
        type={'Days'}
      />
      <DateTimeDisplay
        value={hours}
        type={'Hours'}
      />
      <DateTimeDisplay
        value={minutes}
        type={'Minutes'}
      />
      <DateTimeDisplay
        value={seconds}
        type={'Seconds'}
      />

    </View>
  )
}

const CountDownTimer = ({ targetDate, onCountDownFinished }) => {
  const [days, hours, minutes, seconds] = useCountDown(targetDate)

  if ((days + hours + minutes + seconds) <= 0) {
    onCountDownFinished()
  } else {
    return (
      <CountDownDisplay
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
      />
    )
  }
}

export default CountDownTimer