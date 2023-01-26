import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { OptionsProvider } from './src/context/OptionsContext';
import AppNav from './src/routes/appnav';

const App = () => {

  return (
    <AuthProvider>
      <OptionsProvider>
        <AppNav />
      </OptionsProvider>
    </AuthProvider>
  );
};

export default App;