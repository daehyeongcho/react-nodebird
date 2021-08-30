const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const db = require('./models')

const app = express()
require('dotenv').config()
;(async () => {
	try {
		await db.sequelize.sync() // create table if not exists
		console.log('db 연결 성공')
	} catch (err) {
		console.log(err)
	}
})()

/* 미들웨어 */
app.use(
	cors({
		origin: 'http://localhost:3000',
	}),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* 포트 설정 */
app.set('port', process.env.PORT || 3065)

/* 라우터 */
app.use('/', routes)

/* 포트 개방 */
app.listen(app.get('port'), () => {
	console.log(`server listening on ${app.get('port')}`)
})
