require('dotenv').config({ path: __dirname + '/../.env' })
const jwt = require('jsonwebtoken')

async function main() {
  try {
    // Create a token for an existing user id (replace with one from DB if needed)
    // We'll reuse an id known to exist; if none, this will still test auth path
    const dummyId = '000000000000000000000000' // fallback
    const token = jwt.sign({ id: process.env.TEST_USER_ID || dummyId }, process.env.JWT_SECRET, { expiresIn: '1d' })

    const url = `${process.env.API_BASE || 'http://localhost:5000'}/api/users/students`
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const text = await resp.text()
    console.log('Status:', resp.status)
    try {
      const data = JSON.parse(text)
      console.dir(data, { depth: 3 })
    } catch (e) {
      console.log('Response text:')
      console.log(text.slice(0, 2000))
    }
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message)
  }
}

main()
