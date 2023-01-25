const express = require('express')
const executionRouter = express.Router()
const pool = require('./../database')
const fs = require('fs')
const { authenticateToken, addMaptoSet } = require('./../middleware')
const jwt = require('jsonwebtoken')

const jobUniqueCode = new Set()

//update job activity table
executionRouter.post('/schedule', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `WITH update_job_deadline AS (
        UPDATE job SET completion_deadline = $1 WHERE job_id = $2 RETURNING *
      )
      UPDATE job_activity SET meetup_datetime = $3, meetup_location = $4, duration = $5 WHERE job_id = $2 RETURNING *`,
      [req.body.completion_deadline, req.body.job_id, req.body.meetup_datetime, req.body.meetup_location, req.body.duration],
      async (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          await pool.query(`SELECT update_job_execution_status();`)
          res.status(200).json(results.rows)
          console.log(`Job scheduling on job ID ${req.body.job_id}`)
        } else {
          res.status(403).json({ message: 'Job scheduling failed' })
          console.log('Job scheduling failed')
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//generate unique code
executionRouter.get('/getuniquecode', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    const time = Date.now().toString().slice(-2)
    const uniqueCode = Math.floor(10 + Math.random() * 90)
    const map = new Map()
    map.set('user_id', jwt.decode(token).user_id)
    map.set('unique_code', `${time}${uniqueCode}`)
    addMaptoSet(jobUniqueCode, {
      user_id: jwt.decode(token).user_id,
      unique_code: `${time}${uniqueCode}`
    })
    res.status(200).json({
      user_id: jwt.decode(token).user_id,
      unique_code: `${time}${uniqueCode}`
    })
    console.log(`User ${jwt.decode(token).user_id} get unique code`)
  } catch (error) {
    console.log(error.message)
  }
})

//verify job unique code
executionRouter.post('/verifyuniquecode', authenticateToken, async (req, res) => {
  try {
    for (const item of jobUniqueCode) {
      if (item['user_id'] === req.body.user_id && item['unique_code'] === req.body.unique_code) {
        console.log(item)
        return res.status(200).json({
          message: 'Verified'
        }).end()
      }
    }
    res.status(403).json({ message: 'Not verified' })
  } catch (error) {
    console.log(error.message)
  }
})

// TODO: Work on job duration extension (probably need scoket.io)
const jobDurationExtend = new Set()

//request job duration extend
executionRouter.post('/requestextend', authenticateToken, async (req, res) => {
  try {

  } catch (error) {
    console.log(error.message)
  }
})

//add new review
executionRouter.post('/submitreview', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `WITH review_insert AS (
          INSERT INTO review 
          VALUES(DEFAULT, $1,$2,$3,$4,$5)
          RETURNING *
      )
      UPDATE job_activity 
      SET job_execution_status = $6 
      FROM review_insert 
      WHERE job_activity.job_id = $1
      RETURNING *;`,
      [req.body.job_id, req.body.user_type, jwt.decode(token).user_id, req.body.comment, req.body.ratings, 'completed'],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          console.log(results.rows)
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} submitted job review`)
        } else {
          res.status(403).json({ message: 'failed' })
          console.log(`Job review submission failed`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = executionRouter