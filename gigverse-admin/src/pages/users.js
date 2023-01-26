import React, { useEffect, useState } from 'react'
import SideMenu from '../components/sideMenu'
import BASE_URL from '../utils/BASE_URL'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

function Users() {
  const [userList, setUserList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState({})

  const getUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        setUserList(json)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  const handleVerify = async (user) => {
    try {
      console.log(user)
      const response = await fetch(`${BASE_URL}/admin/user/${user.user_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      if (response.status === 200) {
        const json = await response.json()
        json.user_id = user.user_id
        setModalData(json)
        setShowModal(!showModal)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const updateVerification = async (values) => {
    console.log(modalData.user_id)
    try {
      const response = await fetch(`${BASE_URL}/admin/updateuserverification`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ user_type: values.user_type, user_id: values.user_id })
      })
      if (response.status === 200) {
        setShowModal(!showModal)
        alert('User type updated!')
        getUsers()
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div >
      <SideMenu />
      <Modal style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        height: '90%',
        zIndex: 100, backgroundColor: '#fff',
        border: '1px solid',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '100px'
      }}
        show={showModal}
        onHide={() => setShowModal(!showModal)}
        onBackdropClick={() => setShowModal(!showModal)}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <Modal.Header>
            <Modal.Title style={{ fontSize: 20 }}>Verifiy user</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* <div style={{ display: 'flex', flexDirection: 'column' }}> */}
            <p>User's Matric Card No.: {modalData.first_name || 'not set'}</p>
            <p>User's Profile Picture&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;User's Student Card</p>
            <img src={`data:image/jpeg;base64,${modalData.profilePic}`} style={{ width: 300, height: 400, objectFit: 'contain', border: '1px solid' }} />
            <img src={`data:image/jpeg;base64,${modalData.studentCard}`} style={{ width: 300, height: 400, objectFit: 'contain', border: '1px solid' }} />
            {/* </div> */}
          </Modal.Body>
          <Formik
            initialValues={{ user_type: '', user_id: modalData.user_id }}
            enableReinitialize={true}
            onSubmit={(values) => updateVerification(values)}
          >
            {formikProps => (
              <div style={{ alignItem: 'flex-start', justifyContent: 'left' }}>
                <h3>Change User Type:</h3>
                <Dropdown options={['job_owner', 'job_seeker', 'external', 'guest']} onChange={(value) => formikProps.values.user_type = value.value} value={''} placeholder="Select an option" />
                <div style={{ position: 'absolute', bottom: 10 }}>
                  <Button variant="secondary" onClick={() => setShowModal(!showModal)}>
                    Close
                  </Button>
                  <Button variant="primary">Remind User</Button>
                  <Button variant="primary" onClick={formikProps.handleSubmit}>Update</Button>
                </div>
              </div>
            )}
          </Formik>
        </div>
      </Modal>
      <div className='container'>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>User Type</th>
              <th>Email Address</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, index) => (
              <tr key={index}>
                <td>{user.user_id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.user_type}</td>
                <td>{user.email}</td>
                <td>{user.verified ? 'Yes' : 'No'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button>Edit</button>
                    <button>Delete</button>
                    <button onClick={() => handleVerify(user)}>Verify</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div >
  )
}

export default Users