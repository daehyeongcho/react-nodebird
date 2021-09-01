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
			],
		})
		res.status(200).json(posts)
	} catch (err) {
		console.error(err)
		next(err)
	}
})

module.exports = router
