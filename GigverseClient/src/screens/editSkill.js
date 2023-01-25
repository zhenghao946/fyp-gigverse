import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState, useRef } from 'react'
import CustomStyles from '../styles'
import { OptionsContext } from '../context/OptionsContext'
import { Icon } from '@rneui/base'
import BigButton from '../components/bigButton'
import BASE_URL from './BASE_URL'
import EncryptedStorage from 'react-native-encrypted-storage';

const EditSkill = ({ navigation }) => {
  const { listOfSkills } = useContext(OptionsContext)
  const [userSkills, setUserSkills] = useState([])
  const [userSkillsQueue, setUserSkillsQueue] = useState([])
  const [skillsDeleteQueue, setSkillsDeleteQueue] = useState([])
  const [isChanged, setIsChanged] = useState(false)
  const isFirstRender = useRef(true)

  const getSkills = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      let response = await fetch(`${BASE_URL}/user/skills`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        setUserSkills(json.user_skills)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const addSkills = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      let response = await fetch(`${BASE_URL}/user/skills/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          user_skills: userSkillsQueue.map((skill) => (skill.skill_category_id))
        })
      })
      if (response.status === 200) {
        const json = await response.json()
        await setUserSkills([...userSkills, ...json.user_skills])
        await setUserSkillsQueue([])
      }
    } catch (error) {

    }
  }

  const delSkills = async () => {
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      let response = await fetch(`${BASE_URL}/user/skills/delete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          user_skills: skillsDeleteQueue.map((skill) => (skill.skill_category_id))
        })
      })
      if (response.status === 200) {
        const json = await response.json()
        const set = new Set(json.user_skills)
        await setUserSkills(userSkills.filter((_) => !set.has(_)))
        await setSkillsDeleteQueue([])
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    getSkills()
  }, [])

  useEffect(() =>
    navigation.addListener('beforeRemove', (e) => {
      if (!isChanged) {
        return;
      }
      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes.',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => { } },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    }), [navigation, isChanged])

  useEffect(() => {
    if (!isFirstRender.current && userSkillsQueue.length > 0 || skillsDeleteQueue.length > 0)
      setIsChanged(true)
    isFirstRender.current = false
  }, [userSkillsQueue, skillsDeleteQueue])

  return (
    <>
      <ScrollView style={[CustomStyles.defaultScreenView, { height: isChanged === true ? '90%' : '100%' }]}>
        <Text style={CustomStyles.heading5}>Owned skill</Text>
        {listOfSkills.map((skill, index) => (
          userSkills.find((item) => item === skill.skill_category_id) != undefined ?
            <View key={index} style={[CustomStyles.horizontalContainer, { marginBottom: 10 }]}>
              <Text style={CustomStyles.heading6}>{skill.name}</Text>
              <TouchableOpacity
                style={CustomStyles.abosuluteRight}
                onPress={() => {
                  if (skillsDeleteQueue.find((item) => item.name === skill.name) != undefined) {
                    setSkillsDeleteQueue(skillsDeleteQueue.filter((_) => _ != skill))
                  } else setSkillsDeleteQueue([...skillsDeleteQueue, skill])
                }}
              >
                <Icon name={skillsDeleteQueue.find((item) => item.name === skill.name) != undefined ? 'check' : 'clear'} type='materials' color={'red'} />
              </TouchableOpacity>
            </View>
            : null
        ))}
        <Text style={CustomStyles.heading5}>Add more skill</Text>
        {listOfSkills.map((skill, index) => (
          userSkills.find((item) => item === skill.skill_category_id) != undefined ? null :
            <View key={index} style={[CustomStyles.horizontalContainer, { marginBottom: 10 }]}>
              <Text style={CustomStyles.heading6}>{skill.name}</Text>
              <TouchableOpacity
                style={CustomStyles.abosuluteRight}
                onPress={() => {
                  if (userSkillsQueue.find((item) => item.name === skill.name) != undefined) {
                    setUserSkillsQueue(userSkillsQueue.filter((_) => _ != skill))
                  } else setUserSkillsQueue([...userSkillsQueue, skill])
                }}
              >
                <Icon name={userSkillsQueue.find((item) => item.name === skill.name) != undefined ? 'check' : 'add'} type='materials' />
              </TouchableOpacity>
            </View>
        ))}
      </ScrollView>
      {isChanged === true
        ? <View style={{ height: '10%', justifyContent: 'center' }}>
          <BigButton
            label={'Save Changes'}
            disable={!isChanged}
            onPress={() => {
              if (userSkillsQueue.length > 0) addSkills()
              if (skillsDeleteQueue.length > 0) delSkills()
              setIsChanged(false)
            }}
          />
        </View>
        : null}
    </>
  )
}

export default EditSkill