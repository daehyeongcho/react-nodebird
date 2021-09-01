const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')

const { User, Post } = require('../models')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router()

/* GET /user/ : 로그인 유저 정보 */
router.get('/', async (req, res, next) => {
	try {
		/* 로그인 되어 있을 때만 사용자 정보 불러오기 */
		if (req.user) {
			const fullUserWithoutPassword = await User.findOne({
				where: { email: req.user.email }, // 조건 설정
				attributes: { exclude: ['password'] }, // 가져오고 싶은 column 설정
				include: [
					/* User model의 associate 중에 가져오고 싶은 것을 추가로 적음 */
					{
						model: Post,
						attributes: ['id'], // 메모리 낭비를 줄이기 위해 primary key만 가져옴
					},
					{
						model: User,
						as: 'Followings',
						attributes: ['email'], // 메모리 낭비를 줄이기 위해 primary key만 가져옴
					},
					{
						model: User,
						as: 'Followers',
						attributes: ['email'], // 메모리 낭비를 줄이기 위해 primary key만 가져옴
					},
				],
			})
			res.status(200).json(fullUserWithoutPassword)
		} else {
			res.status(200).json(null)
		}
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* POST /user/login */
router.post('/login', isNotLoggedIn, (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			console.error(err)
			return next(err) // 서버 에러
		}
		if (info) {
			return res.status(401).send(info.reason) // 클라이언트 에러
		}
		console.log(user)
		/* 패스포트 로그인 */
		return req.login(user, async (loginErr) => {
			/* 패스포트 모듈 로그인 에러 */
			if (loginErr) {
				console.error(loginErr)
				return next(loginErr)
			}
			const fullUserWithoutPassword = await User.findOne({
				where: { email: user.email }, // 조건 설정
				attributes: { exclude: ['password'] }, // 가져오고 싶은 column 설정
				include: [
					/* User model의 associate 중에 가져오고 싶은 것을 추가로 적음 */
					{
						model: Post,
					},
					{
						model: User,
						as: 'Followings',
					},
					{ model: User, as: 'Followers' },
				],
			})
			return res.status(200).json(fullUserWithoutPassword) // 사용자 정보를 프론트로 넘겨준다.
		})
	})(req, res, next) // 미들웨어 확장
})

/* POST /user/logout */
router.post('/logout', isLoggedIn, (req, res, next) => {
	req.logout()
	req.session.destroy()
	res.status(200).send('logout succeeded')
})

/* POST /user/ : 회원가입 */
router.post('/', isNotLoggedIn, async (req, res, next) => {
	try {
		const { email, nickname } = req.body
		const exUser = await User.findOne({
			where: { email },
		}) // 이미 그 이메일 사용하는 유저가 있는지 검색
		if (exUser) {
			return res.status(403).send('이미 사용중인 아이디입니다.') // status 400(사용자가 잘못 보냄)
		}

		const password = await bcrypt.hash(req.body.password, 10) // 비밀번호는 그대로 저장하지 않고 bcrypt 암호화해서 저장
		const result = await User.create({
			email,
			nickname,
			password,
		}) // 이메일, 닉네임, 패스워드로 유저 생성
		console.log(result)
		res.status(201).send('ok') // 생성 성공
	} catch (err) {
		console.error(err)
		next(err) // status 500(서버 쪽 에러)
	}
})

/* PATCH /user/nickname */
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
	try {
		await User.update(
			{
				nickname: req.body.nickname,
			},
			{
				where: { email: req.user.email },
			},
		)
		res.status(200).json({ nickname: req.body.nickname })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

module.exports = router
