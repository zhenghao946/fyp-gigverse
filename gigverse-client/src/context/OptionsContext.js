import React, { createContext, useState, useEffect } from 'react'
import BASE_URL from '../screens/BASE_URL';
export const OptionsContext = createContext();

export const OptionsProvider = ({ children }) => {
  const [listOfSkills, setListOfSkills] = useState([])
  const field_of_study_options = [
    'Field 1',
    'Field 2',
    'Field 3',
    'Field 4',
  ]

  const university_options = [
    'Universiti Malaysia Sabah (KK)',
    'Universiti Malaysia Sabah (Labuan)',
    'Universiti Malaysia Sabah (Sandakan)',
  ]

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
    }
  }

  useEffect(() => {
    getSkills()
  }, [])


  return (
    <OptionsContext.Provider value={{ field_of_study_options, university_options, listOfSkills }}>
      {children}
    </OptionsContext.Provider>
  )
}
