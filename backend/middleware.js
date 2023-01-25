const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token === null) {
    console.log('no token')
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

function checkUserType(allowedUserTypes) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      const decoded_user_type = jwt.decode(token).user_type
      if (allowedUserTypes.includes(decoded_user_type)) {
        next()
      } else {
        res.status(403).json({ message: 'Not authorized' })
        console.log('A wrong user type detected')
      }
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: 'Server error' })
      console.log('Check User Type failed')
    }
  }
}


function expand(rowCount, columnCount, startAt = 1) {
  var index = startAt;
  if (rowCount === 0) return null
  return Array(rowCount)
    .fill(0)
    .map(
      (v) => {
        if (columnCount > 1) return (
          `(${Array(columnCount)
            .fill(0)
            .map((v) => `$${index++}`)
            .join(', ')})`
        )
        else return (
          `$${index++}`
        )
      }
    )
    .join(', ');
}

function addMaptoSet(Set, Map) {
  for (const item of Set) {
    if (item['user_id'] == Map['user_id']) {
      item['unique_code'] = Map['unique_code']
      return
    }
  }
  Set.add(Map)
}

module.exports = {
  authenticateToken,
  checkUserType,
  expand,
  addMaptoSet
}