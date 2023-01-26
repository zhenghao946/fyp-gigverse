import React from 'react'
import { useNavigate } from 'react-router-dom'

function SideMenu() {
  const navigation = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigation('/login', { replace: true })
  }

  return (
    <div className="side-menu">
      <div className="brand-name">
        <h1>Gigverse</h1>
      </div>
      <ul>
        <li onClick={() => navigation('/')}><img src={require('./../assets/logo/dashboard(2).png')} alt="testing" />&nbsp; <span  >Dashboard</span></li>
        <li onClick={() => navigation('/users')}><img src={require('./../assets/logo/reading-book (1).png')} alt="" />&nbsp;<span >Users</span> </li>
        <li><img src={require('./../assets/logo/teacher2.png')} alt="" />&nbsp;<span>Jobs</span> </li>
        {/* <li><img src={require('./../assets/logo/school.png')} alt="" />&nbsp;<span>Job</span> </li>
        <li><img src={require('./../assets/logo/payment.png')} alt="" />&nbsp;<span>Income</span> </li>
        <li><img src={require('./../assets/logo/help-web-button.png')} alt="" />&nbsp; <span>Help</span></li>
        <li><img src={require('./../assets/logo/settings.png')} alt="" />&nbsp;<span>Settings</span> </li> */}
        <li><span onClick={handleLogout}>Logout</span></li>
      </ul>
    </div>
  )
}

export default SideMenu