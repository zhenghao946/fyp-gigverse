export default getTime = (input) => {
  const dateTime = (typeof input === 'string' ? new Date(input) : input)
  utc = new Date(dateTime).getTime() + (new Date(dateTime).getTimezoneOffset() * 60000)
  offset = 8
  return new Date(utc + (3600000 * offset)).getTime()
}