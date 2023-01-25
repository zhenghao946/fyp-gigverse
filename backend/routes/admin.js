const express = require('express')
const adminRouter = express.Router()
const pool = require('./../database')

adminRouter.get('/users', async (req, res) => {
  try {
    const userInfo = await pool.query(
      'SELECT * FROM users'
    )
      .then(console.log('Showing all users now'))
      .catch(error => { console.log(error) })
    res.json(userInfo.rows)
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = adminRouter