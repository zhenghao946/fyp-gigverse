import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import SideMenu from './components/sideMenu';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Users from './pages/users';

function App() {

  useEffect(() => {
    document.title = "Gigverse Admin"
  }, [])
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/users" element={<Users />}></Route>
        </Routes>
      </BrowserRouter>

    </>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

export default App;
