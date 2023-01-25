require('dotenv').config()
const express = require('express')
const pool = require('./database')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { authenticateToken } = require('./middleware')
const http = require('http')

const { Server } = require('socket.io')

const authRouter = require('./routes/auth')
const adminRouter = require('./routes/admin')
const userRouter = require('./routes/user')
const jobRouter = require('./routes/job')
const uploadRouter = require('./routes/upload')
const chattingRouter = require('./routes/chatting')

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app);
const io = new Server(server, { pingTimeout: 60000 })

//routes
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/user', userRouter)
app.use('/job', jobRouter)
app.use('/upload', uploadRouter)
app.use('/chatting', chattingRouter)

const PORT = 4000
server.listen(PORT, () => {
  console.log(`Serving running on port ${PORT}`)
})

const user_socket = []
let chat_messages = [{
  id: '001',
  sender_id: '001',
  receipent_id: '002',
  message: 'Hello',
  send_time: '2022-10-7 7:50:00',
  isRead: true,
},
{
  id: '002',
  sender_id: '002',
  receipent_id: '001',
  message: 'Hi',
  send_time: '2022-10-7 7:50:00',
  isRead: true,
},
{
  id: '003',
  sender_id: '001',
  receipent_id: '002',
  message: 'Have you eaten?',
  send_time: '2022-10-7 7:50:00',
  isRead: false,
},
{
  id: '004',
  sender_id: '002',
  receipent_id: '001',
  message: 'Nah im very hungry now',
  send_time: '2022-10-7 7:50:00',
  isRead: true,
},
{
  id: '005',
  sender_id: '001',
  receipent_id: '002',
  message: 'Wanna go eat?',
  send_time: '2022-10-7 7:50:00',
  isRead: false,
},
{
  id: '006',
  sender_id: '002',
  receipent_id: '001',
  message: 'Sufian Cafe?',
  send_time: '2022-10-7 7:50:00',
  isRead: false,
},
{
  id: '007',
  sender_id: '001',
  receipent_id: '002',
  message: 'Sureeee vamos',
  send_time: '2022-10-7 7:50:00',
  isRead: false,
},]

//socket io initialization
io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('disconnect', () => {
    socket.disconnect()
    console.log('🔥: A user disconnected');
  });

  socket.on('configure_user', (input) => {
    console.log(socket.id)
    console.log(input.userToken)
    const getRoomIDs = async () => {
      try {
        await pool.query(
          `SELECT DISTINCT job_id FROM (
              SELECT job_id FROM job WHERE owner_user_id = $1 AND job_status <> 'deleted'
              UNION
              SELECT job_id FROM job_activity WHERE (owner_user_id = $1 OR seeker_user_id = $1) AND job_execution_status <> 'completed'
              UNION
              SELECT job_id FROM user_job_application WHERE seeker_user_id = $1 AND application_status <> 'rejected'
          ) AS temp;
          `,
          [jwt.decode(input.userToken).user_id],
          (error, results) => {
            if (error) throw error
            if (results.rowCount > 0) {
              const room_ids = results.rows.map((item) => (item.job_id))
              room_ids.map(async (id) => {
                await socket.join(String(id))
              })
            }
          }
        )
      } catch (error) {
        console.log(error.message)
      }
    }
    getRoomIDs()
  })

  socket.on('check_joined_rooms', () => {
    console.log(socket.rooms)
  })

  socket.on('job_application', (input) => {
    const joinNewRoom = async () => {
      try {
        await pool.query(
          `SELECT DISTINCT job_id FROM (
              SELECT job_id FROM job WHERE owner_user_id = $1
              UNION
              SELECT job_id FROM job_activity WHERE owner_user_id = $1 OR seeker_user_id = $1
              UNION
              SELECT job_id FROM user_job_application WHERE seeker_user_id = $1
          ) AS temp;
          `,
          [jwt.decode(input.userToken).user_id],
          (error, results) => {
            if (error) throw error
            if (results.rowCount > 0) {
              const room_ids = results.rows.map((item) => (item.job_id))
              console.log(room_ids)
              room_ids.map(async (id) => {
                if (socket.rooms.has(String(id))) console.log('room joined')
                else {
                  await socket.join(String(id), () => console.log(`joined room with ID ${String(id)}`))
                  socket.to(String(id)).emit('notify_job_owner', { job_id: id })
                }
              })
            }
          }
        )
      } catch (error) {
        console.log(error.message)
      }
    }
    joinNewRoom()
  })

  socket.on('job_approval', (input) => {
    const notifySeeker = async () => {
      await pool.query(
        `SELECT * FROM job_activity WHERE job_id = $1`,
        [input.job_id],
        (error, results) => {
          if (error) throw error
          if (results.rowCount > 0) {
            socket.to(String(input.job_id)).emit('notify_job_seeker', { seeker_user_id: results.rows[0].seeker_user_id })

          }
        }
      )
    }
    notifySeeker()
  })

  socket.on('verify_meetup_details', (input) => {
    socket.to(String(input.job_id)).emit('notify_job_owner_schedule', { seeker_user_id: input.seeker_user_id })
  })

  socket.on('job_execution', (input) => {
    socket.to(String(input.job_id)).emit('notify_job_start', { job_id: input.job_id })
  })

  socket.on('countdown_confirmation', (input) => {
    io.in(String(input.job_id)).emit('countdown_begin', { duration: input.duration })
  })

  socket.on('job_end_confirmation', (input) => {
    io.in(String(input.job_id)).emit('job_end', { job_id: input.job_id })
  })
});

//routes
//show all skills
app.get('/skills', async (req, res) => {
  try {
    await pool.query(
      `SELECT * FROM skill_category`, (error, results) => {
        if (error) throw error
        if (results.rowCount > 0) {
          res.status(200).json(results.rows)
          console.log(`App loaded skills into OptionContext`)
        } else {
          res.status(403).send('No data in found in the database')
          console.log(`App failed to load skills into OptionContext`)
        }
      }
    )
  } catch (error) {
    res.status(401).send(error)
    console.log(`App failed to load skills into OptionContext`)
  }
})


  // const authHeader = socket.handshake.headers.authorization
  // const token = authHeader.split(' ')[1]
  // console.log(token)
  // user_socket.push({
  //   socket_id: socket.id,
  //   user_id: jwt.decode(token).user_id
  // })
  // console.log(user_socket)

  // Need to make sure this runs first in frontend. To set user_id
  // socket.on('update_authorization', (data) => {
  //   socket.handshake.headers.authorization = data.Authorization;
  //   const authHeader = socket.handshake.headers.authorization
  //   const token = authHeader.split(' ')[1]
  //   user_socket.push({
  //     socket_id: socket.id,
  //     user_id: jwt.decode(token).user_id
  //   })
  // });

  // socket.on('find_chat', async (config) => {
  //   await pool.query(
  //     `SELECT sender_user_id, recipient_user_id, text, sent_datetime FROM chat WHERE (sender_user_id = $1 OR recipient_user_id = $1) AND (sender_user_id = $2 OR recipient_user_id = $2) ORDER BY sent_datetime ASC`,
  //     [jwt.decode(config.user_id).user_id, config.target_user_id],
  //     (error, results) => {
  //       if (error) throw error
  //       if (results.rowCount > 0) {
  //         console.log(`${jwt.decode(config.user_id).user_id}-${config.target_user_id}`)
  //         socket.join('71-72')
  //         socket.emit('chat_found', results.rows)
  //       }
  //     }
  //   )
  // })

  // socket.on('text_message', async (data) => {
  //   let message_status = 'not_send'
  //   const message_info = {
  //     sender_id: jwt.decode(data.user_id).user_id,
  //     receipent_user_id: data.recipient_user_id,
  //     text: data.text,
  //     sent_datetime: new Date()
  //   }
  //   console.log(message_info)
  //   pool.query(
  //     `INSERT INTO chat VALUES (DEFAULT, $1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
  //     [jwt.decode(data.user_id).user_id, data.recipient_user_id, data.text],
  //     (error, results) => {
  //       if (error) throw error
  //       if (results.rowCount > 0) {
  //         message_status = 'sent'
  //       }
  //     }
  //   )
  //   console.log(`${jwt.decode(data.user_id).user_id}-${data.recipient_user_id}`)
  //   socket.emit('receive_message', { ...message_info, message_status: message_status })
  //   socket.to('71-72').emit('receive_message', { ...message_info, message_status: message_status })
  //   // console.log(user_socket)
  //   const recipient_socket_id = user_socket.find((pair) => pair.user_id === data.recipient_user_id)
  //   // console.log(recipient_socket_id)
  //   if (recipient_socket_id) {
  //     console.log(recipient_socket_id.socket_id)
  //     await pool.query(
  //       `SELECT sender_user_id, recipient_user_id, text, sent_datetime FROM chat WHERE (sender_user_id = $1 OR recipient_user_id = $1) AND (sender_user_id = $2 OR recipient_user_id = $2) ORDER BY sent_datetime ASC`,
  //       [jwt.decode(data.user_id).user_id, data.target_user_id],
  //       (error, results) => {
  //         if (error) throw error
  //         if (results.rowCount > 0) {
  //           io.to(recipient_socket_id.socket_id).emit('receive_message', results.rows)
  //           // socket.emit('chat_found', results.rows)
  //         }
  //       }
  //     )
  //     io.to(recipient_socket_id.socket_id).emit('receive_message', { ...message_info, message_status: message_status })
  //     // socket.to(recipient_socket_id.socket_id).emit('find_chat', { user_id: data.user_id, target_user_id: data.recipient_socket_id })
  //   } else console.log(user_socket)
  //   chat_messages.push(message_info)
  // })
