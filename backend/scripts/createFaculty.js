require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const email = process.env.FACULTY_EMAIL || 'faculty@example.com'
    const password = process.env.FACULTY_PASSWORD || 'Password123'

    const existing = await User.findOne({ email })
    if (existing) {
      console.log('Faculty user already exists:')
      console.log('Email:', email)
      console.log('Password:', password)
      process.exit(0)
    }

    const hashed = await bcrypt.hash(password, 10)
    const newUser = await User.create({ name: 'Faculty User', email, password: hashed, role: 'faculty' })
    console.log('Created faculty user:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('UserId:', newUser._id.toString())
    process.exit(0)
  } catch (err) {
    console.error('Error creating faculty user:', err.message)
    process.exit(1)
  }
}

main()
