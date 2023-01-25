import React, { createContext, useEffect, useState } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [userToken, setUserToken] = useState(null)
  // TODO: Strictly for debuggin purpose,Remove initial setState to false
  const [verified, setVerified] = useState(true)

  const login = async (userToken, verified) => {
    setIsLoading(true)
    try {
      setVerified(verified)
      setUserToken(userToken)
      await EncryptedStorage.setItem('userToken', userToken)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      setUserToken(null)
      EncryptedStorage.removeItem('userToken')
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  const isLoggedIn = async () => {
    setIsLoading(true)
    try {
      let userToken = await EncryptedStorage.getItem('userToken')
      setUserToken(userToken)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    isLoggedIn()
  }, [])

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, verified }}>
      {children}
    </AuthContext.Provider>
  )
}
