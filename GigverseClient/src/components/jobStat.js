import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { colors } from '../styles'

const JobStat = ({ imageSource, title, data }) => {
  return (
    <View style={styles.jobStatItemContainer}>
      <Image source={imageSource} style={styles.jobStatIcon} />
      <View>
        <Text style={styles.jobStatText}>{title}</Text>
        <Text style={styles.jobStatData}>{data}</Text>
      </View>
    </View>
  )
}

export default JobStat

const styles = StyleSheet.create({
  jobStatItemContainer: {
    backgroundColor: colors.primary,
    width: '58%',
    height: 70,
    borderWidth: 1,
    borderColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 5,
  },
  jobStatIcon: {
    width: 45,
    height: 45,
    marginRight: 10,
    position: 'absolute',
    left: 5,
  },
  jobStatText: {
    color: '#fff',
    fontSize: 13,
  },
  jobStatData: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'right',
  },
})