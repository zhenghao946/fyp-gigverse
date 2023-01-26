import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import NormalButton from './normalButton'
import { BottomSheet, ListItem, Button } from '@rneui/base'
import BASE_URL from '../screens/BASE_URL'

const SkillSelector = ({ value, formikProps }) => {
  const [visible, setVisible] = useState(false)
  const [listOfSkills, setListOfSkills] = useState([])

  const getSkills = async () => {
    try {
      const response = await fetch(`${BASE_URL}/skills`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        setListOfSkills(json)
      } else {

      }
    } catch (error) {
      console.log(error)
      Alert.alert(error.message)
    }
  }

  const DuplicatedSkill = (skillToAdd) => {
    if (formikProps.values[value].length < 0) return false
    for (let i = 0; i < formikProps.values[value].length; i++) {
      if (formikProps.values[value][i] === skillToAdd) return true
    }
    return false
  }

  useEffect(() => {
    getSkills()
  }, [])

  const SetSkill = (skill) => {
    formikProps.setFieldValue(value, [...formikProps.values[value], skill.skill_category_id])
  }

  return (
    <View>
      <NormalButton
        label={'Add Skill(s)'}
        onPress={() => { setVisible(true) }}
      />
      <BottomSheet isVisible={visible} scrollViewProps={{ height: '60%', alignItem: 'flex-end' }}>
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>
              <View style={styles.horizontalContainer}>
                <Text style={styles.bottomSheetTitle}>Choose job skills</Text>
                <TouchableOpacity style={styles.bottomSheetCloseButton} onPress={() => { setVisible(false) }}>
                  <Text style={styles.bottomSheetCloseButtonText}>
                    x
                    {/* <Icon style={styles.bottomSheetCloseButtonIcon} name='close' type='antdesign' /> */}
                  </Text>
                </TouchableOpacity>
              </View>
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
        {listOfSkills.length > 0
          ? listOfSkills.map((skill, index) => (
            <ListItem key={index} bottomDivider>
              <ListItem.Content>
                <ListItem.Title>
                  <Button
                    onPress={() => {
                      DuplicatedSkill(skill.skill_category_id) == false ? (SetSkill(skill)) : Alert.alert('Same skill pressed twice')
                    }}
                  >
                    {skill.name}
                  </Button>
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
          : <ListItem>
            <ListItem.Content>
              <ListItem.Title style={{ color: 'red' }}>Error retrieving skills</ListItem.Title></ListItem.Content></ListItem>}
      </BottomSheet>
      {/* {dataArray.length > 0
        ? <View style={[styles.skillContainer, { paddingBottom: 10 }]} >
          {dataArray.map((skill, index) => {
            return <Text key={index}>
              {skill}
              <TouchableOpacity
                style={styles.bottomSheetCloseButton}
                onPress={() => {
                  setValue(dataArray.filter((_) => _ != skill))
                  formikProps.setFieldValue(value, formikProps.values[value].filter((_) => _ != listOfSkills.find(value => value.name === skill).skill_category_id))
                }}>
                <Text style={styles.skillDeleteButtom}>
                  x
                </Text>
              </TouchableOpacity></Text>
          })}
        </View>
        : <Text style={{ color: 'red' }}>No skills selected, please select at least 1 skill needed to perform the job</Text>
      } */}
      {formikProps.values[value].length > 0
        ? <View style={[styles.skillContainer, { paddingBottom: 10 }]} >
          {formikProps.values[value].map((skill, index) => {
            return <Text key={index}>
              {(listOfSkills.find(value => value.skill_category_id === skill))?.name}
              <TouchableOpacity
                style={styles.bottomSheetCloseButton}
                onPress={() => {
                  formikProps.setFieldValue(value, formikProps.values[value].filter((_) => _ != listOfSkills.find(value => value.skill_category_id === skill).skill_category_id))
                }}>
                <Text style={styles.skillDeleteButtom}>
                  x
                </Text>
              </TouchableOpacity></Text>
          })}
        </View>
        : <Text style={{ color: 'red' }}>No skills selected, please select at least 1 skill needed to perform the job</Text>
      }
    </View>
  )
}

export default SkillSelector

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
  },
  skillContainer: {
    borderWidth: 1,
    marginTop: 10,
    borderColor: 'grey',
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bottomSheetCloseButton: {
    borderRadius: 20,
    width: '25%',
    alignContent: 'center',
    justifyContent: 'center',
    display: 'flex',
    height: 35,
    right: -180,
    marginLeft: 'auto',
    padding: 5,
  },
  bottomSheetTitle: {
    fontSize: 18,
    alignContent: 'center',
    justifyContent: 'center',
  },
  bottomSheetCloseButtonText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'red',
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  bottomSheetCloseButtonIcon: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  skillDeleteButtom: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'red',
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
})