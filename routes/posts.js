const express = require('express')

const { Post, User, Image, Comment } = require('../models')

const router = express.Router()

/* GET /posts/ */
router.get('/', async (req, res, next) => {
	try {
		const posts = await Post.findAll({
			limit: 10, // 가져올 갯수 설정
			order: [
				['createdAt', 'DESC'],
				[Comment, 'createdAt', 'DESC'],
			], // 최신 글부터
			include: [
				{
					model: User, // 작성자 정보
					attributes: ['email', 'nickname'],
				},
				{
					model: Image, // 첨부 이미지 정보
				},
				{
					model: Comment, // 댓글 정보
					include: [
						{
							model: User,
							attributes: ['email', 'nickname'],
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
