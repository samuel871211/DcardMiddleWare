const mysql2 = require('mysql2/promise')

async function mysql(ip) {
    try {
        const db = await mysql2.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'middleware',
        })
        let arr = [ip]
        let sql = 'SELECT * FROM `middleware` WHERE `ip` = ?'
        let record = await db.execute(sql, arr)
        record = record[0][0]
        const now = new Date()
        const hour = now.getHours()
        const reset = 60 * (59 - now.getMinutes()) + (60 - now.getSeconds())
        if (typeof(record) === 'undefined') {
            arr = [ip, hour, 999]
            sql = 'INSERT INTO `middleware` (ip,lastrequesthour,remain) VALUES (?,?,?)'
            const result = await db.execute(sql, arr)
            return [999, reset]
        } else {
            if (hour !== record.lastrequesthour) {
                arr = [hour, 999, ip]
            } else if (record.remain > 0) {
                arr = [hour, record.remain - 1, ip]
            } else {
                return [0, reset]
            }
            sql = 'UPDATE `middleware` SET lastrequesthour = ? , remain = ? WHERE ip = ?'
            const result = await db.execute(sql, arr)
            return [arr[1], reset]
        }
    } catch (e) {
        console.log(e)
        return [-1, -1]
        // DB Error, 可能要啟動備援機制...
    }
}
module.exports = mysql