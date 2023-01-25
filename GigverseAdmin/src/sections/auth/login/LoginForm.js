import { useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as yup from 'yup';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import BASE_URL from '../../../utils/BASE_URL';
// components
import Iconify from '../../../components/iconify';


// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const login = async (values) => {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password
      })
    })
    if (response.status === 200) {
      navigate('/dashboard', { replace: true });
      localStorage.setItem('adminToken', 'haha')
    }
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email()
      .required('Email is required'),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&().])[A-Za-z\d@$!%*?&().]*$/,
        'Password must contain at least upper & lower case letters, a number, and a symbol')
      .required('Password is required'),
  })

  return (
    <>
      <Stack spacing={3}>
        <Formik
          initialValues={{ email: '', password: '' }}
          onSubmit={(values) => login(values)}
          validationSchema={validationSchema}
        >
          {formikProps => (
            <>
              <TextField
                name="email"
                label="Email address"
                onChange={formikProps.handleChange('email')}
                error={Boolean(formikProps.errors.email)}
                helperText={formikProps.errors.email && String(formikProps.errors.email)}
              />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                onChange={formikProps.handleChange('password')}
                error={Boolean(formikProps.errors.password)}
                helperText={formikProps.errors.password && String(formikProps.errors.password)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={formikProps.handleSubmit}>
                Login
              </LoadingButton>
            </>
          )}
        </Formik>
      </Stack>
      {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" title='Remember me' />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack> */}
    </>
  );
}
