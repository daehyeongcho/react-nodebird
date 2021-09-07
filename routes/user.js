const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const { Op } = require('sequelize')

const { User, Post, Comment, Image } = require('../models')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router()

/* GET /user : 로그인 유저 정보 */
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
						attributes: ['id'],
					},
					{
						model: User,
						as: 'Followings',
						attributes: ['email'],
					},
					{
						model: User,
						as: 'Followers',
						attributes: ['email'],
					},
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

/* POST /user : 회원가입 */
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

/* PATCH /user/1/follow */
router.patch('/:userEmail/follow', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { email: req.params.userEmail } })
		if (!user) {
			res.status(403).send('없는 사람을 팔로우하려고 하시네요?')
		}

		await user.addFollowers(req.user.email) // 찾은 유저의 팔로워 명단에 로그인 유저 email 저장
		res.status(200).json({ email: user.email, nickname: user.nickname })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* DELETE /user/1/follow */
router.delete('/:userEmail/follow', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { email: req.params.userEmail } })
		if (!user) {
			res.status(403).send('없는 사람을 언팔로우하려고 하시네요?')
		}

		await user.removeFollowers(req.user.email) // 찾은 유저의 팔로워 명단에서 로그인 유저 email 삭제
		res.status(200).json({ email: user.email })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* DELETE /user/follower/2 */
router.delete('/follower/:email', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { email: req.params.email } })
		if (!user) {
			res.status(403).send('없는 사람을 차단하려고 하시네요?')
		}

		await user.removeFollowings(req.user.email) // 찾은 유저의 팔로잉 명단에서 로그인 유저 email 삭제
		res.status(200).json({ email: user.email })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* GET /user/followers */
router.get('/followers', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { email: req.user.email } })
		if (!user) {
			res.status(403).send('로그인 사용자 정보가 없습니다.')
		}

		const followers = await user.getFollowers({
			limit: parseInt(req.query.limit, 10),
		})
		res.status(200).json(followers)
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* GET /user/followings */
router.get('/followings', isLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findOne({ where: { email: req.user.email } })
		if (!user) {
			res.status(403).send('로그인 사용자 정보가 없습니다.')
		}

		const followings = await user.getFollowings({
			limit: parseInt(req.query.limit, 10),
		})
		res.status(200).json(followings)
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* GET /user/:email */
router.get('/:email', async (req, res, next) => {
	try {
		const fullUserWithoutPassword = await User.findOne({
			where: { email: req.params.email },
			attributes: {
				exclude: ['password'],
			},
			include: [
				{
					model: Post,
					attributes: ['id'],
				},
				{
					model: User,
					as: 'Followings',
					attributes: ['email'],
				},
				{
					model: User,
					as: 'Followers',
					attributes: ['email'],
				},
			],
		})

		if (fullUserWithoutPassword) {
			const data = fullUserWithoutPassword.toJSON()
			data.Posts = data.Posts.length
			data.Followings = data.Followings.length
			data.Followers = data.Followers.length
			res.status(200).json(data)
		} else {
			res.status(404).json('존재하지 않는 사용자입니다.')
		}
	} catch (error) {
		console.error(error)
		next(error)
	}
})

/* GET /user/:email/posts/ */
router.get('/:email/posts', async (req, res, next) => {
	try {
		const lastId = parseInt(req.query.lastId, 10)
		const where = { UserEmail: req.params.email }

		/* 초기 로딩이 아닐 때 */
		if (lastId) {
			where.id = { [Op.lt]: parseInt(req.query.lastId, 10) } // lastId보다 낮은 id의 post를 불러오게 됨
		}

		const posts = await Post.findAll({
			where,
			limit: 10, // 가져올 갯수 설정
			order: [
				['createdAt', 'DESC'],
				[Comment, 'createdAt', 'DESC'],
			], // 최신 글, 댓글부터
			include: [
				{
					model: Image, // 첨부 이미지
				},
				{
					model: User, // 게시글 작성자
					attributes: ['email', 'nickname'],
				},
				{
					model: Comment, // 댓글
					include: [
						{
							model: User, // 댓글 작성자
							attributes: ['email', 'nickname'],
						},
					],
				},
				{
					model: User, // 좋아요 누른 사람
					as: 'Likers',
					attributes: ['email'],
				},
				{
					model: Post, // 리트윗 게시글
					as: 'Retweet',
					include: [
						{
							model: User,
							attributes: ['email', 'nickname'],
						},
						{
							model: Image,
						},
					],
				},
			],
		})
		res.status(200).json(posts)
	} catch (err) {
		console.error(err)
		next(err)
	}
})

module.exports = router
