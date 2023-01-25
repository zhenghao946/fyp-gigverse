const express = require('express')
const paymentRouter = express.Router()
const pool = require('./../database')
const fs = require('fs')
const { authenticateToken, expand, checkUserType } = require('./../middleware')
const jwt = require('jsonwebtoken')
const https = require('https')
const path = require('path')

// generate bill from billplz
paymentRouter.post('/generatebill', authenticateToken, checkUserType(['job_owner', 'external']), async (req, res) => {
  data = {
    ...req.body,
    callback_url: 'https://c08c-2001-d08-c4-a896-7054-f4ee-ad02-5bec.ap.ngrok.io/storebill',
    redirect_url: 'redirect'
  }

  const request = https.request({
    hostname: 'www.billplz-sandbox.com',
    path: '/api/v3/bills',
    method: 'POST',
    headers: {
      'Authorization': 'Basic NTVkMzYzZDEtZmM5Zi00ZTc0LTk0ZjMtODc2MDk4ZDBmYzcyOg==',
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(data).length
    }
  }, (response) => {
    let responseData = ''

    response.on('data', (chunk) => {
      responseData += chunk
    })

    response.on('end', async () => {
      fs.appendFile(path.join(__dirname, 'bills.txt'), '\n' + responseData, (error) => {
        if (error) throw error
      })
      console.log(responseData)
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      const billInfo = JSON.parse(responseData)
      await pool.query(
        `WITH payment_insert AS (
            INSERT INTO payment 
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
        )
        UPDATE job_activity 
        SET job_execution_status = $11 
        FROM payment_insert 
        WHERE job_activity.job_id = $2
        RETURNING *;`,
        [billInfo.id, req.body.job_id, jwt.decode(token).user_id, req.body.seeker_user_id, 'NOW()', (billInfo.amount / 100), billInfo.paid_amount, billInfo.collection_id, billInfo.callback_url, billInfo.paid, 'pending payment'],
        (error, results) => {
          if (error) throw error
          if (results.rowCount > 0) {
            res.status(200).json(results.rows[0]).end()
            console.log(`${jwt.decode(token).user_id} generated bill`)
          } else {
            res.status(403).send('Bill generating failed')
            console.log(`${jwt.decode(token).user_id} failed to generate bill`)
          }
        }
      )
    })
  })

  request.on('error', (error) => {
    console.log(error)
  })

  request.write(JSON.stringify(data))
  request.end()

})

// callback_url for billplz bill generation
paymentRouter.post('/storebill', async (req, res) => {
  console.log('haha')
})

paymentRouter.get('/getchats', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    await pool.query(
      // `SELECT DISTINCT ON (LEAST(sender_user_id, recipient_user_id), GREATEST(recipient_user_id, sender_user_id)) sender_user_id, recipient_user_id FROM chat WHERE sender_user_id = $1 OR recipient_user_id = $1`,
      `SELECT DISTINCT ON (LEAST(sender_user_id, recipient_user_id), GREATEST(sender_user_id, recipient_user_id)) sender_user_id, recipient_user_id, text, sent_datetime FROM chat WHERE (sender_user_id = $1 OR recipient_user_id = $1) ORDER BY LEAST(sender_user_id, recipient_user_id), GREATEST(sender_user_id, recipient_user_id), sent_datetime DESC`,
      [jwt.decode(token).user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          const result = results.rows.map((chat) => {
            let keyToRemove = (chat.sender_user_id === jwt.decode(token).user_id) ? 'sender_user_id' : 'recipient_user_id'
            let keyToRename = (keyToRemove === 'recipient_user_id') ? 'sender_user_id' : 'recipient_user_id'
            return Object.entries(chat).reduce((newChat, [key, value]) => {
              if (key === keyToRename) {
                key = 'user_id'
                return { ...newChat, [key]: value }
              }
              if (key !== keyToRemove) return { ...newChat, [key]: value }
              return newChat
            }, {})
          })
          res.status(200).json(result)
        } else res.status(404)
      }
    )
  } catch (error) {
    console.log(error.message)
  }
})

module.exports = paymentRouter