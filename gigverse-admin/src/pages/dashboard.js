import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideMenu from '../components/sideMenu'
function Dashboard() {
  const navigation = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigation('/login', { replace: true })
    }
  }, [])
  return (
    <div>
      <SideMenu />
      <div class="container">
        <div class="header">
          <div class="nav">
            <div class="search">
              <input type="text" placeholder="Search.." />
              <button type="submit"><img src={require('./../assets/logo/search.png').default} alt="" /></button>
            </div>
            <div class="user">
              <a href="#" class="btn">Add New</a>
              <img src={require('./../assets/logo/notifications.png')} alt="" />
              <div class="img-case">
                <img src="user.png" alt="" />
              </div>
            </div>
          </div>
        </div>
        <div class="content">
          <div class="cards">
            <div class="card">
              <div class="box">
                <h1>2194</h1>
                <h3>Students</h3>
              </div>
              <div class="icon-case">
                <img src="students.png" alt="" />
              </div>
            </div>
            <div class="card">
              <div class="box">
                <h1>53</h1>
                <h3>Teachers</h3>
              </div>
              <div class="icon-case">
                <img src="teachers.png" alt="" />
              </div>
            </div>
            <div class="card">
              <div class="box">
                <h1>5</h1>
                <h3>Schools</h3>
              </div>
              <div class="icon-case">
                <img src="schools.png" alt="" />
              </div>
            </div>
            <div class="card">
              <div class="box">
                <h1>350000</h1>
                <h3>Income</h3>
              </div>
              <div class="icon-case">
                <img src="income.png" alt="" />
              </div>
            </div>
          </div>
          <div class="content-2">
            <div class="recent-payments">
              <div class="title">
                <h2>Recent Payments</h2>
                <a href="#" class="btn">View All</a>
              </div>
              <table>
                <tr>
                  <th>Name</th>
                  <th>School</th>
                  <th>Amount</th>
                  <th>Option</th>
                </tr>
                <tr>
                  <td>John Doe</td>
                  <td>St. James College</td>
                  <td>$120</td>
                  <td><a href="#" class="btn">View</a></td>
                </tr>
                <tr>
                  <td>John Doe</td>
                  <td>St. James College</td>
                  <td>$120</td>
                  <td><a href="#" class="btn">View</a></td>
                </tr>
                <tr>
                  <td>John Doe</td>
                  <td>St. James College</td>
                  <td>$120</td>
                  <td><a href="#" class="btn">View</a></td>
                </tr>
                <tr>
                  <td>John Doe</td>
                  <td>St. James College</td>
                  <td>$120</td>
                  <td><a href="#" class="btn">View</a></td>
                </tr>
                <tr>
                  <td>John Doe</td>
                  <td>St. James College</td>
                  <td>$120</td>
                  <td><a href="#" class="btn">View</a></td>
                </tr>
                <tr>
                  <td>John Doe</td>
                  <td>St. James College</td>
                  <td>$120</td>
                  <td><a href="#" class="btn">View</a></td>
                </tr>
              </table>
            </div>
            <div class="new-students">
              <div class="title">
                <h2>New Students</h2>
                <a href="#" class="btn">View All</a>
              </div>
              <table>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>option</th>
                </tr>
                <tr>
                  <td><img src="user.png" alt="" /></td>
                  <td>John Steve Doe</td>
                  <td><img src="info.png" alt="" /></td>
                </tr>
                <tr>
                  <td><img src="user.png" alt="" /></td>
                  <td>John Steve Doe</td>
                  <td><img src="info.png" alt="" /></td>
                </tr>
                <tr>
                  <td><img src="user.png" alt="" /></td>
                  <td>John Steve Doe</td>
                  <td><img src="info.png" alt="" /></td>
                </tr>
                <tr>
                  <td><img src="user.png" alt="" /></td>
                  <td>John Steve Doe</td>
                  <td><img src="info.png" alt="" /></td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard