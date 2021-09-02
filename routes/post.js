const express = require('express')

const { Post, Comment, Image, User } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

/* POST /post */
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
		res.status(201).json(fullPost)
	} catch (err) {
		console.error(error)
		next(err)
	}
})

/* DELETE /post/1 */
router.delete('/:id', isLoggedIn, async (req, res, next) => {
	try {
		const id = parseInt(req.params.id, 10)
		await Post.destroy({
			where: {
				id,
				UserEmail: req.user.email, // 내가 작성한 글만 삭제
			},
		})
		res.status(200).json({ id })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* POST /post/1/comment */
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
	try {
		const id = parseInt(req.params.postId, 10)
		/* 존재하지 않는 게시글에 댓글 작성하려고 하는 경우 */
		const post = await Post.findOne({
			where: { id },
		})
		if (!post) {
			return res.status(403).send('존재하지 않는 게시글입니다.')
		}

		const comment = await Comment.create({
			content: req.body.content,
			PostId: id,
			UserEmail: req.user.email, // deserializeUser에서 req.user 만들어줌
		}) // comment 생성하고 DB에 저장

		const fullComment = await Comment.findOne({
			where: {
				id: comment.id,
			},
			include: [{ model: User, attributes: ['email', 'nickname'] }],
		}) // 추가로 코멘트 작성자 정보 넘겨줌
		res.status(201).json(fullComment)
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* PATCH /post/1/like */
router.patch('/:id/like', isLoggedIn, async (req, res, next) => {
	try {
		const id = parseInt(req.params.id, 10)
		const post = await Post.findOne({
			where: { id },
		})
		/* id가 postId인 게시글이 존재하지 않으면 */
		if (!post) {
			return res.status(403).send('게시글이 존재하지 않습니다.')
		}

		/* 존재하면 */
		await post.addLikers(req.user.email)
		res.json({ PostId: post.id, UserEmail: req.user.email })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

/* DELETE /post/1/like */
router.delete('/:id/like', isLoggedIn, async (req, res, next) => {
	try {
		const id = parseInt(req.params.id, 10)
		const post = await Post.findOne({
			where: { id },
		})
		/* id가 postId인 게시글이 존재하지 않으면 */
		if (!post) {
			return res.status(403).send('게시글이 존재하지 않습니다.')
		}

		/* 존재하면 */
		await post.removeLikers(req.user.email)
		res.status(200).json({ PostId: post.id, UserEmail: req.user.email })
	} catch (err) {
		console.error(err)
		next(err)
	}
})

module.exports = router
