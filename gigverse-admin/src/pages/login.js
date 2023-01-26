import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import BASE_URL from './../utils/BASE_URL';

function Login() {
  const navigation = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (values) => {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: values.username, password: values.password })
    })
    if (response.status === 200) {
      const json = await response.json()
      localStorage.setItem('adminToken', json.adminToken)
      console.log(localStorage.getItem('adminToken'))
      navigation('/', { replace: true })
    } else {
      setErrorMessage('Login failed')
    }
  }

  return (
    <div>
      <h1>Gigverse Admin Portal</h1>
      <h2>Login</h2>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={values => handleLogin(values)}
      >
        {formikProps => (
          <div>
            <Form>
              <div>
                <p>Username</p>
                <Field type="text" name="username" />
                <ErrorMessage name="username" component="div" />
              </div>
              <div>
                <p>Password</p>
                <Field type="password" name="password" />
                <ErrorMessage name="password" component="div" />
              </div>

              <button type="submit" onClick={formikProps.handleSubmit}>
                Submit
              </button>
              <p>{errorMessage || ''}</p>
            </Form>

          </div>
        )}

      </Formik>
    </div>
  )
}

export default Login