require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const User = require('../models/User')

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
    const users = await User.find().select('-password')
    console.log('Users in DB:')
    console.dir(users, { depth: 3 })
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
