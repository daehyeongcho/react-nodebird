const express = require('express')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')

const routes = require('./routes')
const db = require('./models')
const passportConfig = require('./passport')

const app = express()

;(async () => {
	try {
		await db.sequelize.sync() // CREATE TABLE IF NOT EXISTS
		console.log('db 연결 성공')
	} catch (err) {
		console.log(err)
	}
})()
require('dotenv').config() // dotenv 모듈
passportConfig() // passport 모듈

/* 미들웨어 */
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true, // 쿠키 허용
	}),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(
	session({
		saveUninitialized: false,
		resave: false,
		secret: process.env.COOKIE_SECRET,
	}),
)
app.use(passport.initialize())
app.use(passport.session())

/* 포트 설정 */
app.set('port', process.env.PORT || 3065)

/* 라우터 */
app.use('/', routes)

/* 포트 개방 */
app.listen(app.get('port'), () => {
	console.log(`server listening on ${app.get('port')}`)
})
