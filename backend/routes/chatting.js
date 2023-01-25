const express = require('express')
const chattingRouter = express.Router()
const pool = require('./../database')
const { authenticateToken, expand } = require('./../middleware')
const jwt = require('jsonwebtoken')
const fs = require('fs')

chattingRouter.get('/getchats', authenticateToken, async (req, res) => {
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

// get specific conversation
chattingRouter.get('/getchat/:id', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const user_id = req.params.id
    await pool.query(
      `SELECT sender_user_id, recipient_user_id, text, sent_datetime FROM chat WHERE (sender_user_id = $1 OR recipient_user_id = $1) AND (sender_user_id = $2 OR recipient_user_id = $2) ORDER BY sent_datetime DESC`,
      [jwt.decode(token).user_id, user_id],
      (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
        }
      }
    )
  } catch (error) {

  }
})

module.exports = chattingRouter