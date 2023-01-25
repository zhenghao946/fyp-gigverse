const express = require('express')
const authRouter = express.Router()
const pool = require('./../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//register a user
authRouter.post('/register', async (req, res) => {
  try {
    const { email, phone_num, first_name, last_name, student_id } = req.body
    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    console.log(salt)
    console.log(hashedPassword)
    await pool.query(
      `SELECT * FROM users WHERE email = $1 OR phone_num = $2 OR student_id = $3`,
      [email.trim(), phone_num, student_id],
      async (error, results) => {
        if (error) throw error
        if (results.rowCount === 0) {
          try {
            await pool.query(
              `INSERT INTO users (user_id, email, password, phone_num, first_name, last_name, owner_ratings, seeker_ratings, student_id, user_type, verified) VALUES (DEFAULT, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
              [email.trim(), hashedPassword, phone_num, first_name, last_name, 3.5, 3.5, student_id, 'guest', false],
              (error, results) => {
                if (error) throw error
                if (results.rowCount > 0) {
                  res.status(200).send('User registered').end()
                  console.log(`${results.rows[0].user_id} Registered!`)
                } else {
                  res.status(403).send('Error regisering user').end()
                  console.log('User registration failed')
                }
              }
            )
          } catch (error) {
            console.log(error.message)
            return
          }
        } else {
          results.rows.map((result) => {
            if (email === result.email) {
              res.status(201).send('Email already exists')
              res.end()
              console.log('User register but email exists')
              return
            }
            if (phone_num === result.phone_num) {
              res.status(201).send('Phone number already exists')
              res.end()
              console.log('User register but phone num exists')
              return
            }
            if (student_id === result.student_id) {
              res.status(201).send('Student ID already exists')
              res.end()
              console.log('User register but student id exists')
              return
            }
          })
        }
      }
    )
  } catch (error) {
    console.error(error.message)
    return
  }
})

//logging in
authRouter.post('/login', async (req, res) => {
  try {
    await pool.query(
      `SELECT user_id, password, first_name, user_type, verified  FROM users WHERE email = $1`,
      [req.body.email.trim()],
      async (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          if (await bcrypt.compare(req.body.password, results.rows.at(0).password)) {
            if (results.rows.at(0).user_type === 'job_owner') req.job_owner = true
            else req.job_owner = false
            const accessToken = jwt.sign({
              user_id: results.rows.at(0).user_id,
              user_type: results.rows.at(0).user_type
            }, process.env.ACCESS_TOKEN_SECRET)
            res.status(200).json({
              body: results.rows.at(0),
              accessToken: accessToken
            })
            console.log(`${results.rows[0].user_id} Login!`)
          } else {
            res.status(401).send('Incorrect email / password')
            console.log(`${req.body.email} Login failed`)
            return
          }
        }
        else {
          res.status(401).send('Incorrect email / password')
          console.log(`${req.body.email} Login failed`)
          return
        }
      }
    )
  } catch (error) {
    console.log(error.message)
    return
  }
})
module.exports = authRouter