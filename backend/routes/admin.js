const express = require('express')
const adminRouter = express.Router()
const pool = require('./../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const { authenticateToken, expand } = require('./../middleware')

adminRouter.post('/login', async (req, res) => {
  try {
    await pool.query(
      `SELECT * FROM admin WHERE username = $1`,
      [req.body.username],
      async (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          if (await bcrypt.compare(req.body.password, results.rows.at(0).password)) {
            const accessToken = jwt.sign({
              admin_id: results.rows.at(0).admin_id,
              username: results.rows.at(0).username
            }, process.env.ACCESS_TOKEN_SECRET)
            res.status(200).json({ adminToken: accessToken })
          }
        } else {
          res.status(403).send('Username not found')
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

adminRouter.get('/users', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
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

adminRouter.get('/user/:id', authenticateToken, async (req, res) => {
  const user_id = req.params.id
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `SELECT *, student_card_image.file_name as student_card, profile_image.file_name as profile_pic FROM users
        LEFT JOIN student_card_image ON users.user_id = student_card_image.user_id
        LEFT JOIN profile_image ON users.user_id = profile_image.user_id
        WHERE users.user_id = $1
      `,
      [user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          console.log(req.body.user_id)
          results.rows[0].user_id = req.body.user_id
          const profilePicPromise = results.rows[0].profile_pic ? new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '..', 'images', 'users', 'profile', results.rows[0].profile_pic), (error, content) => {
              if (error) reject(error)
              else resolve(content.toString('base64'))
            })
          }) : null
          const studentCardPromise = results.rows[0].student_card ? new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '..', 'images', 'users', 'student_card', results.rows[0].student_card), (error, content) => {
              if (error) reject(error)
              else { resolve(content.toString('base64')) }
            })
          }) : null
          Promise.all([profilePicPromise, studentCardPromise])
            .then((values) => {
              res.status(200).json({
                ...results.rows[0],
                profilePic: values[0],
                studentCard: values[1]
              }).end()
            })
          // return res.status(200).json({
          //   ...results.rows[0],
          //   profilePic: null,
          //   studentCard: null
          // }).end()
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

adminRouter.post('/updateuserverification', authenticateToken, async (req, res) => {
  try {
    console.log(req.body)
    await pool.query(
      `UPDATE users SET user_type = $1, verified = $2 WHERE user_id = $3 RETURNING *`,
      [req.body.user_type, true, req.body.user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).end()
        } else res.status(403).send('Update failed').end()
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = adminRouter