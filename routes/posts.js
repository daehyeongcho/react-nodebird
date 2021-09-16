const express = require('express')
const { Op } = require('sequelize')

const { Post, User, Image, Comment } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

/* GET /posts/ */
router.get('/', async (req, res, next) => {
	try {
		const lastId = parseInt(req.query.lastId, 10)
		const where = {}

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

/* GET /posts/related */
router.get('/related', isLoggedIn, async (req, res, next) => {
	try {
		const lastId = parseInt(req.query.lastId, 10)
		const followings = await User.findAll({
			attributes: ['email'],
			include: [{ model: User, as: 'Followers', where: { email: req.user.email } }],
		})
		const where = {
			UserEmail: {
				[Op.in]: followings.map((v) => v.email),
			},
		}

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
