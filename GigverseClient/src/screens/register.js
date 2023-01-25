import { StyleSheet, Text, View, Alert, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import FormInput from './../components/formInput'
import BigButton from './../components/bigButton'
import CustomStyles from '../styles'
import BASE_URL from './BASE_URL.js'
import { Formik } from 'formik'
import FormikInput from '../components/FormikInput'
import * as yup from 'yup'

const Register = ({ navigation }) => {

  const [loading, setLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  async function signUpWithEmail(values) {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { Accept: 'application/json', "Content-type": "application/json" },
        body: JSON.stringify(values)
      })
      if (response.status === 200) {
        Alert.alert('You are registered!')
        navigation.navigate('Login')
      } else if (response.status === 201) {
        const errorMessage = await response.text()
        Alert.alert(errorMessage)
      }
    } catch (error) {
      Alert.alert(error.message)
    }
    setLoading(false)
  }

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .email("Please enter valid email")
      .required('Email Address is Required'),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&().])[A-Za-z\d@$!%*?&().]*$/,
        'Password must contain at least upper & lower case letters, a number, and a symbol')
      .required('Password is required'),
    phone_num: yup
      .string()
      .notOneOf(["+60"], 'Please input your phone number')
      .min(12, 'Please input a complete phone number')
      .required('Phone number is required'),
    first_name: yup
      .string()
      .required('First name is required'),
    last_name: yup
      .string()
      .required('Last name is required'),
  })

  return (
    <SafeAreaProvider>
      <Formik
        initialValues={{
          email: '',
          phone_num: '+60',
          password: '',
          first_name: '',
          last_name: '',
        }}
        onSubmit={values => {
          signUpWithEmail(values)
        }}
        validationSchema={validationSchema}
      >
        {formikProps => (
          <>
            <ScrollView style={styles.registerScreen} showsVerticalScrollIndicator={false}>
              <Text style={CustomStyles.heading4}>Sign Up</Text>
              <Text style={[CustomStyles.text, { marginBottom: 20 }]}>You have to be a university student to create an account.</Text>
              <FormikInput
                label='Email'
                formikProps={formikProps}
                value='email'
                placeholder='user@example.com'
              />
              <FormikInput
                label='Phone Number'
                formikProps={formikProps}
                value='phone_num'
                placeholder='+60123456789'
                keyboardType='phone-pad'
              />
              <Text style={[CustomStyles.text, { marginTop: 10 }]}>Password must contain 8 characters including upper & lower case letters, a number and a symbol. eg: "iloveGigVerse123"</Text>
              <FormikInput
                label='Password'
                formikProps={formikProps}
                value='password'
                password={true}
              />
              <FormInput
                label='Confirm Password'
                value={confirmPassword}
                setText={setConfirmPassword}
                password={true}
              />
              {formikProps.values.password === confirmPassword
                ? null
                : <Text style={{ color: 'red', borderRadius: 10 }}>Passwords does not match</Text>
              }
              {formikProps.values.password === confirmPassword ? null : formikProps.isValid = false}
              <FormikInput
                label='First Name'
                formikProps={formikProps}
                value='first_name'
              />
              <FormikInput
                label='Last Name'
                formikProps={formikProps}
                value='last_name'
              />
            </ScrollView>
            <View style={{ height: '10%', justifyContent: 'center' }}>
              <BigButton
                disable={!formikProps.isValid}
                label='Register'
                onPress={formikProps.handleSubmit}
              />
            </View>
          </>
        )}
      </Formik>
    </SafeAreaProvider >
  )
}

export default Register

const styles = StyleSheet.create({
  registerScreen: {
    margin: 10,
    flex: 1
  },
  // skillContainer: {
  //   borderWidth: 1,
  //   marginTop: 10,
  //   borderColor: 'grey',
  //   borderRadius: 10,
  //   height: 200,
  //   paddingLeft: 10,
  //   backgroundColor: '#fff',
  // },
  // bottomSheetCloseButton: {
  //   borderRadius: 20,
  //   width: '25%',
  //   alignContent: 'center',
  //   justifyContent: 'center',
  //   display: 'flex',
  //   height: 35,
  //   right: -180,
  //   marginLeft: 'auto',
  //   padding: 5,
  // },
  // bottomSheetTitle: {
  //   fontSize: 18,
  //   alignContent: 'center',
  //   justifyContent: 'center',
  // },
  // bottomSheetCloseButtonText: {
  //   fontWeight: 'bold',
  //   fontSize: 20,
  //   color: 'red',
  //   alignContent: 'center',
  //   justifyContent: 'center',
  //   textAlign: 'center',
  // },
  // bottomSheetCloseButtonIcon: {
  //   alignContent: 'center',
  //   justifyContent: 'center',
  // },
  // skillDeleteButtom: {
  //   fontWeight: 'bold',
  //   fontSize: 15,
  //   color: 'red',
  //   alignContent: 'center',
  //   justifyContent: 'center',
  //   textAlign: 'center',
  // },
})