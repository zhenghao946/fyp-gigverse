const express = require('express')
const ownerRouter = express.Router()
const pool = require('./../database')
const fs = require('fs')
const { authenticateToken, expand, checkUserType } = require('./../middleware')
const jwt = require('jsonwebtoken')

ownerRouter.post('/add', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (jwt.decode(token).user_type === 'job_owner') {
    try {
      await pool.query(
        `SELECT user_type FROM users WHERE user_id = $1`,
        [jwt.decode(token).user_id],
        async (error, results) => {
          if (error) throw error
          if (results.rows.at(0).user_type === 'job_owner') {
            try {
              await pool.query(
                `INSERT INTO job VALUES (DEFAULT, 'posted',$1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                [jwt.decode(token).user_id, req.body.price, req.body.title, req.body.description, 'NOW()', req.body.application_deadline, req.body.completion_deadline],
                async (error, results) => {
                  if (error) throw error
                  if (results.rowCount > 0) {
                    const jobInfo = results.rows.at(0)
                    const job_id = results.rows.at(0).job_id
                    const rawBody = req.body.job_skills
                    const requestBody = rawBody.map((v) => [v, job_id])
                    if (requestBody.flat().length === 0) {
                      res.status(403).send('Upload error').end()
                      console.log(`User ${jwt.decode(token).user_id} failed to uploaded job`)
                    }
                    await pool.query(
                      `INSERT INTO job_skill_category(skill_category_id, job_id) VALUES ${expand(rawBody.length, 2)} RETURNING *`,
                      requestBody.flat(),
                      (error, results) => {
                        if (error) throw error
                        if (results.rowCount > 0) {
                          res.status(200).json(jobInfo).end()
                          console.log(`User ${jwt.decode(token).user_id} successfully uploaded job`)
                        } else {
                          res.status(403).send('Upload error').end()
                          console.log(`User ${jwt.decode(token).user_id} failed to uploaded job`)
                        }
                      }
                    )
                  } else {
                    res.status(403).send('Upload error').end()
                    console.log(`User ${jwt.decode(token).user_id} failed to uploaded job`)
                  }
                }
              )

            } catch (error) {
              console.log(error.message)
            }
          } else {
            res.status(403).send('Not a job owner').end()
            console.log(`User ${jwt.decode(token).user_id} failed to uploaded job (not job owner)`)
          }
        }
      )
    } catch (error) {
      console.log(error.message)
    }
  } else res.status(403).send('Not authorized').end()
})

//edit job
ownerRouter.post('/edit', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (jwt.decode(token).user_type === 'job_owner') {
    try {
      await pool.query(
        `UPDATE job SET 
        title = $1,
        price = $2,
        description = $3,
        application_deadline = $4,
        completion_deadline = $5
        WHERE job_id = $6 AND owner_user_id = $7
        RETURNING *`,
        [req.body.title,
        req.body.price,
        req.body.description,
        req.body.application_deadline,
        req.body.completion_deadline,
        req.body.job_id, jwt.decode(token).user_id
        ],
        async (error, results1) => {
          if (error) throw error
          if (results1.rowCount > 0) {

            try {
              await pool.query(
                `DELETE FROM job_skill_category
                WHERE job_id = $1 RETURNING skill_category_id`,
                [req.body.job_id],
                async (error, results2) => {
                  if (error) throw error
                  if (results2) {
                    try {
                      const requestBody = req.body.job_skills.map((skill) => ([req.body.job_id, skill]))
                      await pool.query(
                        `INSERT INTO job_skill_category VALUES ${expand(req.body.job_skills.length, 2)} RETURNING skill_category_id`,
                        requestBody.flat(),
                        (error, results3) => {
                          if (error) throw error
                          if (results3.rowCount > 0) {
                            res.status(200).json({
                              ...results1.rows[0],
                              skills_deleted: results2?.rows,
                              skills_added: results3.rows
                            })
                            console.log(`User ${jwt.decode(token).user_id} successfully edit job`)
                          } else {
                            res.status(403).send('new skills insertion issue').end()
                            console.log(`User ${jwt.decode(token).user_id} failed to edit job`)
                          }
                        }
                      )
                    } catch (error) {
                      console.log(error.message)
                    }
                  } else {
                    console.log(results2.rows)
                    res.status(403).send('cnt delete old skills').end()
                  }
                }
              )
            } catch (error) {
              console.log(error.message)
            }
          } else res.status(403).send('cannot update job info').end()
        }
      )
    } catch (error) {
      console.log(error.message)
    }
  } else res.status(403).send('Not authorized').end()
})

//delete job
ownerRouter.post('/delete/:id', authenticateToken, async (req, res) => {
  const job_id = req.params.id
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (jwt.decode(token).user_type === 'job_owner') {
    try {
      await pool.query(
        `UPDATE job SET job_status = $1 WHERE job_id = $2 RETURNING job_id`,
        ['deleted', job_id],
        (error, results) => {
          if (error) throw error
          if (results.rowCount > 0) {
            res.status(200).send(`Job with id:${results.rows[0].job_id} is deleted`)
          } else res.status(403).send('Job deletion unsuccessful, try again')
        }
      )
    } catch (error) {

    }
  } else res.status(403).send('Not authorized').end()
})

//get job application
ownerRouter.get('/viewapplications/:id', authenticateToken, checkUserType(['job_owner', 'external']), async (req, res) => {
  const job_id = req.params.id
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      // `SELECT * FROM user_job_application WHERE EXISTS( SELECT 1 FROM job WHERE owner_user_id = $1 AND job_id = user_job_application.job_id)`,
      `SELECT * FROM user_job_application WHERE job_id = $1`,
      [job_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} view jod ID ${job_id} applications`)
        } else res.status(404).json({ message: 'not found' })
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//accept job application
ownerRouter.post('/acceptjobapplication', authenticateToken, checkUserType(['job_owner', 'external']), async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const { seeker_user_id, job_id } = req.body
  try {
    await pool.query(
      `SELECT EXISTS(SELECT * FROM job_activity WHERE job_id = $1)`,
      [job_id],
      async (error, results) => {
        if (error) throw error
        if (results.rows[0].exists === false) {
          await pool.query(
            `WITH application_update AS (UPDATE user_job_application SET application_status = case seeker_user_id WHEN $1 THEN 'accepted' ELSE 'rejected' END WHERE job_id = $2 RETURNING *) 
              UPDATE job SET job_status = 'confirmed' WHERE job_id = $2 RETURNING *`,
            [seeker_user_id, job_id],
            async (error, results) => {
              if (error) throw error
              if (results.rowCount > 0) {
                await pool.query(
                  `INSERT INTO job_activity(job_id, job_execution_status, seeker_user_id, owner_user_id, meetup_detail_verified) VALUES($1,$2,$3,$4,$5) RETURNING *`,
                  [job_id, 'insufficient info', seeker_user_id, jwt.decode(token).user_id, false],
                  (error, results) => {
                    if (error) throw error
                    if (results.rowCount > 0) {
                      res.status(200).json({ message: 'good' })
                      console.log(`User ${jwt.decode(token).user_id} accepted user ID ${seeker_user_id} for job ID ${job_id}`)
                    } else {
                      res.status(403).json({ message: 'bad' })
                      console.log(`User ${jwt.decode(token).user_id} failed to accept user ID ${seeker_user_id} for job ID ${job_id}`)
                    }
                  }
                )
              } else {
                res.status(403).json({ message: 'bad' })
                console.log(`User ${jwt.decode(token).user_id} failed to accept user ID ${seeker_user_id} for job ID ${job_id}`)
              }
            }
          )
        } else {
          res.status(403).json({ message: 'Job already has a job seeker' })
          console.log(`Job ID ${job_id} already has a job seeker`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = ownerRouter