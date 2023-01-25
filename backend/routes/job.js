const express = require('express')
const jobRouter = express.Router()
const pool = require('./../database')
const fs = require('fs')
const { authenticateToken, expand } = require('./../middleware')
const ownerRouter = require('./owner')
const seekerRouter = require('./seeker')
const executionRouter = require('./execution')
const paymentRouter = require('./payment')
const path = require('path')

jobRouter.use('/owner', ownerRouter)
jobRouter.use('/seeker', seekerRouter)
jobRouter.use('/execute', executionRouter)
jobRouter.use('/payment', paymentRouter)

//get jobs data
jobRouter.post('/view', async (req, res) => {
  try {
    await pool.query(
      `SELECT * FROM job WHERE job_status = 'posted' ORDER BY posted_datetime LIMIT $1 OFFSET $2`,
      [req.body.limit, req.body.lastLoaded],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`Someone viewed explore page`)
        } else res.status(403).send('No job found')
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

//TODO: job searching

//get job by ID
jobRouter.get('/view/:id', async (req, res) => {
  const job_id = req.params.id
  try {
    await pool.query(
      `SELECT * FROM job WHERE job_id = $1`,
      [job_id],
      async (error, results) => {
        if (error) throw error
        // if (results.rows[0].job_status != 'posted') return res.status(403).json({ message: 'job is not long applicable' }).end()
        if (results.rowCount > 0) {
          const jobInfo = results.rows.at(0)
          await pool.query(
            `SELECT skill_category_id FROM job_skill_category WHERE job_id = $1`,
            [job_id],
            async (error, results) => {
              if (error) throw error
              if (results.rowCount > 0) {
                const job_skills = results.rows
                // res.status(200).json({
                //   jobInfo: jobInfo,
                //   job_skills: results.rows
                // }).end()
                try {
                  let jobImages = []
                  await pool.query(
                    `SELECT file_name AS file_name, file_type AS file_type, size AS size, original_name AS original_name FROM job_image WHERE job_id = $1`,
                    [job_id],
                    (error, results) => {
                      if (error) throw error
                      if (results.rowCount > 0) {

                        results.rows.map((file, index) => {
                          // fs.readFileSync(`images/${file.file_name}`, (error, content) => {
                          //   if (error) throw error
                          //   if (content) {
                          //     return jobImages.push({
                          //       uri: content.toString('base64'),
                          //       file_name: file.file_name
                          //     })
                          //   }
                          // })
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
                        job_images: jobImages
                      }).end()
                      console.log(`Someone viewed job ID ${job_id}`)
                    }
                  )
                } catch (error) {
                  console.log(error.message)
                }
              } else {
                res.status(200).json({ jobInfo: jobInfo }).end()
                console.log(`Someone viewed job ID ${job_id}`)
              }
            }
          )
        } else {
          res.status(403).json({ message: 'Job not found' })
          console.log('error viewing job')
        }
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = jobRouter