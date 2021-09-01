const express = require('express')

const { Post, Comment, Image, User } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

/* POST /post/ */
router.post('/', isLoggedIn, async (req, res, next) => {
	try {
		const post = await Post.create({
			content: req.body.content,
			UserEmail: req.user.email, // deserializeUser에서 req.user 만들어줌
		})

		/* 정보를 완성해서 돌려주기 */
		const fullPost = await Post.findOne({
			where: { id: post.id },
			include: [
				{
					model: Image,
				},
				{
					model: Comment,
					include: [
						{
							model: User,
							attributes: ['email', 'nickname'],
						},
					],
				},
				{
					model: User,
					attributes: ['email', 'nickname'],
				},
			],
		})
		res.status(201).json(fullPost)
	} catch (err) {
		console.log(error)
		next(err)
	}
})

/* POST /post/1/comment */
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
	try {
		/* 존재하지 않는 게시글에 댓글 작성하려고 하는 경우 */
		const post = await Post.findOne({
			where: { id: req.params.postId },
		})
		if (!post) {
			return res.status(403).send('존재하지 않는 게시글입니다.')
		}

		const comment = await Comment.create({
			content: req.body.content,
			PostId: req.params.postId,
			UserEmail: req.user.email, // deserializeUser에서 req.user 만들어줌
		}) // comment 생성하고 DB에 저장

		const fullComment = await Comment.findOne({
			where: {
				id: comment.id,
			},
			include: [{ model: User, attributes: ['email', 'nickname'] }],
		})
		res.status(201).json(fullComment)
	} catch (err) {
		console.log(err)
		next(err)
	}
})

/* DELETE /posts/ */
router.delete('/', (req, res) => {
	res.send('delete complete')
})

module.exports = router
