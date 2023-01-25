const express = require('express')
const uploadRouter = express.Router()
const pool = require('./../database')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { authenticateToken, expand } = require('./../middleware')
const fs = require('fs')
const path = require('path')

const uploadSingle = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // console.log(req.options.path)
      cb(null, path.join(__dirname, '..', 'images', req.options.path[0], req.options.path[1]))
    },
    filename: (req, file, cb) => {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      req.file_name = new Date().toLocaleDateString().replaceAll('/', '') + `-${jwt.decode(token).user_id}-` + file.originalname
      cb(null, req.file_name)
    }
  })
}).single('image_data')

//upload muliple files
const uploadMultiple = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'images', 'jobs'))
    },
    filename: (req, file, cb) => {
      req.file_name = new Date().toLocaleDateString().replaceAll('/', '') + `-${req.body.job_id}-` + file.originalname
      cb(null, req.file_name)
    }
  })
}).array('image_data', 5)

uploadRouter.post('/pic/profile', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    req.options = { path: ['users', 'profile'] }
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.log(err.message)
        res.status(403).send('Upload incomplete')
        console.log(`User ID ${jwt.decode(token).user_id} failed to upload profile pics`)
      } else {
        async function InsertToDB() {
          try {
            await pool.query(
              `INSERT INTO profile_image VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET file_name = $2 RETURNING (SELECT file_name FROM profile_image WHERE user_id = $1)`,
              [jwt.decode(token).user_id, req.file_name],
              (error, results) => {
                if (error) throw error
                if (results.rowCount > 0) {
                  res.status(200).send('Upload complete').end()
                  console.log(`User ID ${jwt.decode(token).user_id} uploaded profile pics`)
                } else {
                  res.status(404).send('Unknown error').end()
                  console.log(`unknown error at upload profile pic`)
                }
              }
            )
          } catch (error) {
            console.log(error.message)
          }
        }
        InsertToDB()
      }
    })
  } catch (error) {
    console.log(error.message)
  }
})

uploadRouter.post('/pic/studentcard', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  try {
    req.options = { path: ['users', 'student_card'] }
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.log(err.message)
        res.status(403).send('Upload incomplete')
        console.log(`User ID ${jwt.decode(token).user_id} failed to upload student card pics`)
      } else {
        async function InsertToDB() {
          try {
            await pool.query(
              `INSERT INTO student_card_image VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET file_name = $2 RETURNING (SELECT file_name FROM profile_image WHERE user_id = $1)`,
              [jwt.decode(token).user_id, req.file_name],
              (error, results) => {
                if (error) throw error
                if (results.rowCount > 0) {
                  res.status(200).send('Upload complete').end()
                  console.log(`User ID ${jwt.decode(token).user_id} uploaded student card pic`)
                } else {
                  res.status(404).send('Unknown error').end()
                  console.log(`unknown error at upload student card pic`)
                }
              }
            )
          } catch (error) {
            console.log(error.message)
          }
        }
        InsertToDB()
      }
    })
  } catch (error) {
    console.log(error.message)
  }
})

uploadRouter.post('/files/job', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (jwt.decode(token).user_type === 'job_owner') {
    try {
      uploadMultiple(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.log(err.message)
          res.status(403).send('Upload incomplete')
          console.log(`User ID ${jwt.decode(token).user_id} failed to upload job pics`)
        } else {
          req.files.map((file) => {
            fs.renameSync(file.path, file.path.replace('undefined', req.body.job_id));
            file.filename = file.filename.replace('undefined', req.body.job_id)
            file.path = file.path.replace('undefined', req.body.job_id)
          })
          async function InsertToDB() {
            try {
              if (req.body.job_id === null || req.files === undefined || res.files === undefined) return res.status(200).send('No pics to upload').end()
              const rawBody = req.files
              const requestBody = rawBody.map((v) => [v.originalname, v.mimetype, v.size, v.filename, req.body.job_id])
              await pool.query(
                `INSERT INTO job_image(original_name, file_type, size, file_name, job_id) VALUES ${expand(rawBody.length, 5)} RETURNING *`,
                requestBody.flat(),
                (error, results) => {
                  if (error) throw error
                  if (results.rowCount > 0) {
                    res.status(200).send('Upload complete!').end()
                    console.log(`User ID ${jwt.decode(token).user_id} uploaded job pic`)
                  } else {
                    res.status(404).send('Unknown error').end()
                    console.log(`unknown error at upload job pic`)
                  }
                }
              )
            } catch (error) {
              console.log(error.message)
            }
          }
          InsertToDB()
        }
      })
    } catch (error) {
      console.log(error.message)
    }
  } else {
    res.status(403).send('Not a job owner')
    console.log(`User ID ${jwt.decode(token).user_id} not job owner in upload job pics`)
  }
})

//edit job files
uploadRouter.post('/files/job/edit', authenticateToken, async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (jwt.decode(token).user_type === 'job_owner') {
    try {
      uploadMultiple(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.log(err.message)
          res.status(403).send('Upload incomplete')
          console.log(`User ID ${jwt.decode(token).user_id} failed to re-upload job pics`)
        } else {
          req.files.map((file) => {
            fs.renameSync(file.path, file.path.replace('undefined', req.body.job_id));
            file.filename = file.filename.replace('undefined', req.body.job_id)
            file.path = file.path.replace('undefined', req.body.job_id)
          })
          async function InsertAndDeleteToDB() {
            try {
              if (req.body.job_id === null) {
                console.log('No job ID')
                return res.status(403).send('Noob').end()
              }
              await pool.query(
                `DELETE FROM job_image WHERE job_id = $1 ${req.body.old_files === undefined ? '' : `AND original_name NOT IN (${expand(req.body.old_files.length, 1, 2)})`}`,
                [req.body.job_id, ...req.body.old_files],
                async (error, results) => {
                  if (error) throw error
                  if (results) {
                    try {
                      if (req.body.job_id === null) return res.status(403).send('Noob').end()
                      if (req.files.length > 0) {
                        const rawBody = req.files
                        const requestBody = rawBody.map((v) => [v.originalname, v.mimetype, v.size, v.filename, req.body.job_id])
                        await pool.query(
                          `INSERT INTO job_image(original_name, file_type, size, file_name, job_id) VALUES ${expand(rawBody.length, 5)} RETURNING *`,
                          requestBody.flat(),
                          (error, results) => {
                            if (error) throw error
                            if (results.rowCount > 0) {
                              res.status(200).send('Upload complete!').end()
                              console.log(`User ID ${jwt.decode(token).user_id} re-upload job pic`)
                            } else {
                              res.status(404).send('Unknown error').end()
                              console.log(`unknown error at re-upload job pic`)
                            }
                          }
                        )
                      } else {
                        res.status(204).send('No new files').end()
                        console.log(`no file at re-upload job pic`)
                      }
                    } catch (error) {
                      console.log(error.message)
                    }
                  }
                }
              )
            } catch (error) {
              console.log(error.message)
            }
          }
          InsertAndDeleteToDB()
        }
      })
    } catch (error) {
      console.log(error.message)
    }
  } else {
    res.status(403).send('Not a job owner')
    console.log(`User ID ${jwt.decode(token).user_id} not job owner in upload job pics`)
  }
})

module.exports = uploadRouter