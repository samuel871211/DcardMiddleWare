const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb://localhost:27017'
const options = { useUnifiedTopology: true }

async function mongo(ip) {
    try {
        let remain = null
        let query = { 'ip': ip }
        const db = await MongoClient.connect(uri, options)
        const dbo = db.db('middleware')
        const record = await dbo.collection('middleware').findOne(query)
        const now = new Date()
        const hour = now.getHours()
        const reset = 60 * (59 - now.getMinutes()) + (60 - now.getSeconds())
        if (record === null) {
            query.remain = 999
            query.lastRequestHour = hour
            const result = await dbo.collection('middleware').insertOne(query)
        } else {
            if (hour !== record.lastRequestHour) {
                query.remain = 999
                query.lastRequestHour = hour
            } else if (record.remain > 0) {
                query.remain = record.remain - 1
            } else {
                return [0, reset]
            }
            const result = await dbo.collection('middleware').updateOne(record, { $set: query })
        }
        return [query.remain, reset]
    } catch (e) {
        console.log(e)
        return [-1, -1]
        // DB Error, 可能要啟動備援機制...
    }
}
module.exports = mongo