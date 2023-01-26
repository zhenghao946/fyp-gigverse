import { View, Alert, TouchableOpacity, Text, Image } from 'react-native'
import React, { useContext, useState } from 'react'
import BigButton from '../components/bigButton'
import { AuthContext } from '../context/AuthContext'
import BASE_URL from './BASE_URL.js'
import * as yup from 'yup'
import { Formik } from 'formik'
import FormikInput from '../components/FormikInput'
import CustomStyles, { colors } from '../styles'
import Popup from '../utils/popup'
import { Icon } from '@rneui/base'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useContext(AuthContext)

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .email("Please enter valid email")
      .required('Email Address is Required'),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
  })

  async function signInWithEmail(values) {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password
        })
      })
      if (response.status === 200) {
        const json = await response.json()
        Popup(`Welcome back ${json.body.first_name}`)
        login(json.accessToken, json.body.verified)
      } else {
        Popup('Incorrect email / password. Please try again.')
      }
    } catch (error) {
      console.log(error)
      Alert.alert(error.message)
    }
  }

  return (
    <View style={[CustomStyles.authStackScreen, { alignItems: 'stretch', padding: 10, justifyContent: 'center' }]}>
      <View style={{ marginVertical: 150 }}>
        <Image source={require('./../assets/GigverseLogo.png')} style={{ resizeMode: 'contain', height: 200, width: 200, alignSelf: 'center', marginVertical: -150 }} />
      </View>
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={values => {
          signInWithEmail(values)
        }}
        validationSchema={validationSchema}
      >
        {formikProps => (
          <View>
            <FormikInput
              label='Email'
              formikProps={formikProps}
              value='email'
              placeholder='user@example.com'
            />
            <FormikInput
              label='Password'
              formikProps={formikProps}
              value='password'
              placeholder='password'
              password={true}
            />
            <TouchableOpacity onPress={() => { }}>
              <Text style={CustomStyles.hyperlinkText}>Forgot Password?</Text>
            </TouchableOpacity>
            <BigButton
              disable={!formikProps.isValid}
              label='Login'
              onPress={formikProps.handleSubmit}
            />
          </View>
        )}
      </Formik>
    </View>
  )
}

export default Login