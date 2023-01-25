import buffer from 'buffer'
export default getUserID = (userToken) => {
  const payload = userToken.split('.')[1]
  return JSON.parse(buffer.Buffer.from(payload, 'base64').toString('ascii'))
}