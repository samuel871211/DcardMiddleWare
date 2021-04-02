const express = require('express')
const cors = require('cors')
const url = require("url")
const app = express()
app.use(cors())

const mongo = require('./src/mongo')
const mysql = require('./src/mysql')

app.get('/', async function(req, res) {
    const ip = req.connection.remoteAddress.split(':')[3]
    console.log(req.connection.remoteAddress)
    // const [remain, reset] = await mongo(ip)
    const [remain, reset] = await mysql(ip)

    res.set({
        'X-RateLimit-Remaining': reset,
        'X-RateLimit-Reset': remain,
    })
    if (remain <= 0) {
        res.status(429).send({ 'remain': 0, 'reset': reset })
    } else {
        res.status(200).send({ 'remain': remain, 'reset': reset })
        // 這邊應該是要繼續把request繼續往下送到指定API
        // 因為這個Middleware只處理ip每小時的最多連線次數
    }
})
app.listen(3000)