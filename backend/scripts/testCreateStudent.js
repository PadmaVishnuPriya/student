require('dotenv').config({ path: __dirname + '/../.env' })

async function main() {
  try {
    const url = `${process.env.API_BASE || 'http://localhost:5000'}/api/users/register`
    const payload = {
      name: 'API Test Student',
      email: `apitest_${Date.now()}@example.com`,
      password: 'password123',
      userType: 'student'
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const text = await resp.text()
    console.log('Status:', resp.status)
    try { console.log('JSON:', JSON.parse(text)) } catch (e) { console.log('Text:', text) }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

main()
