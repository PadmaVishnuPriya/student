require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const u = await User.findOne()
    if (!u) {
      console.error('No users found in DB to create token')
      process.exit(1)
    }
    const token = jwt.sign({ id: u._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' })
    // verify locally
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Decoded token locally:', decoded)
    const url = `${process.env.API_BASE || 'http://localhost:5000'}/api/users/students`
    console.log('Using token for user:', u.email, u._id.toString())

    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await resp.json()
    console.log('Status:', resp.status)
    console.dir(data, { depth: 3 })
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
