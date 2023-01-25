const express = require('express')
const seekerRouter = express.Router()
const pool = require('./../database')
const fs = require('fs')
const { authenticateToken, expand, checkUserType } = require('./../middleware')
const jwt = require('jsonwebtoken')

seekerRouter.post('/applyjob', authenticateToken, checkUserType(['job_seeker', 'job_owner', 'external']), async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {

    await pool.query(
      `SELECT COUNT(*) FROM user_job_application WHERE seeker_user_id = $1 and job_id = $2`,
      [jwt.decode(token).user_id, req.body.job_id],
      async (error, results) => {
        if (error) throw error
        if (Number(results.rows[0].count) === 0) {
          await pool.query(
            `INSERT INTO user_job_application VALUES (DEFAULT, $1,$2,$3,$4,$5,$6) RETURNING *`,
            [jwt.decode(token).user_id, req.body.job_id, 'applied', req.body.price_bid, req.body.description, req.body.remarks],
            (error, results) => {
              if (error) throw error
              if (results.rowCount > 0) {
                res.status(200).json(results.rows[0])
                console.log(`User ID ${jwt.decode(token).user_id} applied job ID ${req.body.job_id}`)
              } else {
                res.status(403).send('DB insertion error')
                console.log(`User ID ${jwt.decode(token).user_id} failed to apply job ID ${req.body.job_id}`)
              }
            }
          )
        } else res.status(403).send('Application to this job by this user has already been sent.')
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

seekerRouter.post('/verifymeetupdetail', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `UPDATE job_activity SET meetup_detail_verified = $1 WHERE job_id = $2 RETURNING *`,
      ['true', req.body.job_id],
      async (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          await pool.query(`SELECT update_job_execution_status();`)
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} verified job meetup details`)
        } else res.status(403).send('Unsuccessful').end()
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = seekerRouter