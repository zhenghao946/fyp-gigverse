const express = require('express')
const userRouter = express.Router()
const pool = require('./../database')
const { authenticateToken, expand, checkUserType } = require('./../middleware')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

//view user profile
userRouter.get('/profile', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [jwt.decode(token).user_id],
      async (error, result) => {
        if (error) throw error
        if (result.rowCount > 0) {
          try {
            await pool.query(
              `SELECT student_card_image.file_name AS student_card, profile_image.file_name AS profile_pic
              FROM student_card_image LEFT JOIN profile_image ON student_card_image.user_id = profile_image.user_id WHERE student_card_image.user_id = $1;`,
              [jwt.decode(token).user_id],
              (error, results) => {
                if (error) throw error
                if (results.rowCount > 0) {
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
                        ...result.rows.at(0),
                        profilePic: values[0],
                        studentCard: values[1]
                      }).end()
                      console.log(`User ID ${jwt.decode(token).user_id} viewed profile`)
                    })
                } else {
                  res.status(200).json({
                    ...result.rows.at(0),
                    profilePic: null,
                    studentCard: null
                  }).end()
                  console.log(`User ID ${jwt.decode(token).user_id} viewed profile`)
                }
              }
            )
          } catch (error) {
            console.log(error.message)
          }
        } else {
          res.status(403).send('No data in found in the database')
          console.log(`User ID ${jwt.decode(token).user_id} failed to view profile (no data found)`)
        }
      }
    )
  } catch (error) {
    res.status(401).send('Not allowed')
    console.log(`User ID ${jwt.decode(token).user_id} not allowed to view profile`)
  }
})

//update profile -- can be improved
userRouter.post('/profile/edit', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `UPDATE users 
      SET 
      first_name = $1,
      last_name = $2,
      email = $3,
      phone_num = $4,
      address = $5,
      field_of_study = $6,
      university = $7,
      student_id = $8
      WHERE user_id = $9
      RETURNING *`,
      [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.phone_num,
        req.body.address,
        req.body.field_of_study,
        req.body.university,
        req.body.student_id,
        jwt.decode(token).user_id
      ], (error, results) => {
        if (error) { console.log(error.message); return res.status(403).send(error.message) }
        if (results.rowCount > 0) {
          res.status(200).json({
            body: results.rows.at(0)
          })
          console.log(`User ID ${jwt.decode(token).user_id} edit profile`)
        } else {
          res.status(403).send('Error writing into database')
          console.log(`User ID ${jwt.decode(token).user_id} failed to edit profile`)
        }
      }
    )
  } catch (error) {
    res.status(401).send(error)
    console.log(`Unknown error at editing profile`)
  }
})

//show user skill
userRouter.get('/skills', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `SELECT skill_category_id FROM user_skill_category WHERE user_id = $1`,
      [jwt.decode(token).user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json({
            user_skills: results.rows.map((skill) => (skill.skill_category_id))
          }).end()
          console.log(`User ID ${jwt.decode(token).user_id} viewed skills`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//add user skills
userRouter.post('/skills/add', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    const user_id = jwt.decode(token).user_id
    const requestBody = req.body.user_skills.map((skill) => ([user_id, skill]))
    await pool.query(
      `INSERT INTO user_skill_category VALUES ${expand(req.body.user_skills.length, 2)} RETURNING skill_category_id`,
      requestBody.flat(),
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json({
            user_skills: results.rows.map((skill) => (skill.skill_category_id))
          })
          console.log(`User ID ${jwt.decode(token).user_id} added skills`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//remove user skills
userRouter.post('/skills/delete', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    await pool.query(
      `DELETE FROM user_skill_category WHERE user_id = $1 and skill_category_id IN (${expand(req.body.user_skills.length, 1, 2)}) RETURNING skill_category_id`,
      [jwt.decode(token).user_id, ...req.body.user_skills],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          // res.status(200).send(`Skills (${results.rows.map((skill) => `${skill.skill_category_id}`).join(`, `)}) deleted!`).end()
          res.status(200).json({ user_skills: results.rows.map((skill) => (skill.skill_category_id)) }).end()
          console.log(`User ID ${jwt.decode(token).user_id} deleted skills`)
        } else {
          res.status(200).send('Error').end()
          console.log(`unknown error at delete skills`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//user posted jobs for home page
userRouter.get('/postedjobs', authenticateToken, checkUserType(['job_owner', 'external']), async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    await pool.query(
      `SELECT job_id AS job_id, title AS title, job_status, (SELECT COUNT(*) FROM user_job_application WHERE user_job_application.job_id = job.job_id) AS applicants FROM job WHERE owner_user_id = $1 AND job_status = 'posted' OR job_status = 'expired' ORDER BY 
    CASE job_status
        WHEN 'posted' THEN 1
        WHEN 'expired' THEN 2
    END LIMIT 3;`,
      [jwt.decode(token).user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} loaded home (postedjobs)`)
        } else {
          res.status(403).json({ message: 'No posted jobs' })
          console.log(`User ID ${jwt.decode(token).user_id} loaded home (postedjobs) but empty`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//fetch saved jobs for explore page
userRouter.get('/savedjobids', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `SELECT job_id FROM user_liked_job WHERE user_id = $1`,
      [jwt.decode(token).user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json({ saved_jobs: results.rows.map((id) => (id.job_id)) })
          console.log(`User ID ${jwt.decode(token).user_id} saved jobs (for explore)`)
        } else {
          res.status(200).json({ saved_jobs: [] })
          console.log(`User ID ${jwt.decode(token).user_id} failed to retrieve saved jobs (for explore)`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//add saved job
userRouter.post('/savejob', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `INSERT INTO user_liked_job VALUES ($1,$2) RETURNING *`,
      [jwt.decode(token).user_id, req.body.job_id],
      (error, results) => {
        if (error) {
          res.status(404).send('Not found')
          console.log(`User ID ${jwt.decode(token).user_id} failed to save job ID ${req.body.job_id}`)
          return
        }
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} added saved job ID ${req.body.job_id} into saved job`)
        } else {
          res.status(403).send('Error adding, please check again')
          console.log(`User ID ${jwt.decode(token).user_id} failed to save job ID ${req.body.job_id}`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//remove saved job
userRouter.post('/removesavejob', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `DELETE FROM user_liked_job WHERE job_id = $1 RETURNING *`,
      [req.body.job_id],
      (error, results) => {
        if (error) {
          res.status(404).send('Not found')
          console.log(`User ID ${jwt.decode(token).user_id} failed to remove saved job ID ${req.body.job_id}`)
          return
        }
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} removed saved job ID ${req.body.job_id} into saved job`)
        } else {
          res.status(403).send('Error adding, please check again')
          console.log(`User ID ${jwt.decode(token).user_id} failed to removed saved job ID ${req.body.job_id}`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//fetch user saved job summary
userRouter.get('/savedjob', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `SELECT job_id, title, price FROM job WHERE EXISTS (SELECT 1 FROM user_liked_job WHERE user_liked_job.job_id = job.job_id AND user_id = $1);`,
      [jwt.decode(token).user_id],
      (error, results) => {
        if (error) {
          res.status(404).send('Not found')
          cconsole.log(`User ID ${jwt.decode(token).user_id} failed to load home (savedjobs)`)
          return
        }
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} loaded home (savedjobs)`)
        } else {
          res.status(403).send('Error loading, please check again')
          console.log(`User ID ${jwt.decode(token).user_id} loaded home (savedjobs) but empty`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//get upcoming jobs
userRouter.get('/upcomingjob', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    await pool.query(
      `SELECT job_id, job_execution_status, meetup_datetime, meetup_location, (SELECT title FROM job WHERE job.job_id = job_activity.job_id), (SELECT price FROM job WHERE job.job_id = job_activity.job_id) FROM job_activity WHERE (seeker_user_id = $1 OR owner_user_id = $1) AND job_execution_status <> $2 LIMIT 2;`,
      [jwt.decode(token).user_id, 'completed'],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`User ID ${jwt.decode(token).user_id} loaded home (upcomingjobs)`)
        } else {
          res.status(403).json({ message: 'No posted jobs' })
          console.log(`User ID ${jwt.decode(token).user_id} loaded home (upcomingjobs) but empty`)
        }
      }
    )
  } catch (error) {
    console.log(error)
  }
})

//get upcoming job by id
userRouter.get('/upcomingjob/:id', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const job_id = req.params.id
  try {
    await pool.query(
      `SELECT * FROM job INNER JOIN job_activity ON job_activity.job_id = job.job_id WHERE job.job_id = $1 LIMIT 1`,
      [job_id],
      async (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          const jobInfo = results.rows.at(0)
          const userRole = results.rows.at(0).owner_user_id === jwt.decode(token).user_id ? 'job_owner' : 'job_seeker'
          await pool.query(
            `SELECT skill_category_id FROM job_skill_category WHERE job_id = $1`,
            [job_id],
            async (error, results) => {
              if (error) throw error
              if (results.rowCount > 0) {
                const job_skills = results.rows
                try {
                  let jobImages = []
                  await pool.query(
                    `SELECT file_name AS file_name, file_type AS file_type, size AS size, original_name AS original_name FROM job_image WHERE job_id = $1`,
                    [job_id],
                    (error, results) => {
                      if (error) throw error
                      if (results.rowCount > 0) {

                        results.rows.map((file, index) => {
                          const data = fs.readFileSync(path.join(__dirname, '..', 'images', 'jobs', file.file_name), 'base64')
                          jobImages.push({
                            uri: data,
                            file_name: file.file_name,
                            file_type: file.file_type,
                            size: file.size,
                            original_name: file.original_name,
                          })
                        })
                      }
                      res.status(200).json({
                        jobInfo: jobInfo,
                        job_skills: job_skills,
                        job_images: jobImages,
                        user_role: userRole
                      }).end()
                      console.log(`User ID ${jwt.decode(token).user_id} view upcoming job ID ${job_id}`)
                    }
                  )
                } catch (error) {
                  console.log(error.message)
                }
              } else {
                res.status(403).json({ message: 'Job not found' }).end()
                console.log(`User ID ${jwt.decode(token).user_id} failed to view upcoming job ID ${job_id}`)
              }
            }
          )
        } else {
          res.status(403).json({ message: 'Job not found' }).end()
          console.log(`User ID ${jwt.decode(token).user_id} failed to view upcoming job ID ${job_id}`)
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = userRouter