const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { Post, Comment, Image, User, Hashtag } = require('../models')
const { isLoggedIn } = require('./middlewares')

const router = express.Router()

/* uploads 폴더가 없어서 새로 생성 */
try {
	fs.accessSync('uploads')
} catch (err) {
	console.log('uploads 폴더가 없으므로 생성합니다.')
	fs.mkdirSync('uploads')
}

/* multer 미들웨어 선언 */
const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, done) {
			done(null, 'uploads')
		},

		/* 랜디.jpg */
		filename(req, file, done) {
			const ext = path.extname(file.originalname) // 확장자 추출(.jpg)
			const basename = path.basename(file.originalname, ext) // 랜디
			done(null, basename + '_' + new Date().getTime() + ext) // 랜디_15184712891.jpg
		},
	}),
	limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
})

/* POST /post */
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
	try {
		const hashtags = req.body.content.match(/#[^\s#]+/g)
		const post = await Post.create({
			content: req.body.content,
			UserEmail: req.user.email, // deserializeUser에서 req.user 만들어줌
		})

		/* 해쉬태그 처리 */
		if (hashtags) {
			/* 이미 존재하는 해쉬태그면 새로 생성해서 올릴 필요 없음 */
			const result = await Promise.all(
				hashtags.map((tag) =>
					Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } }),
				),
			) // return [hashtag, 생성됐는지아닌지여부]
			await post.addHashtags(result.map((v) => v[0]))
		}

		/* 이미지를 올린 경우 */
		if (req.body.image) {
			/* 이미지를 여러 개 올린 경우 image: [랜디.jpg, 제로초.jpg] */
			if (Array.isArray(req.body.image)) {
				const images = await Promise.all(
					req.body.image.map((image) => Image.create({ src: image })),
				) // DB엔 이미지 파일을 직접 올리지 않고 주소만 저장함.
				await post.addImages(images)
			} else {
				/* 이미지를 하나만 올린 경우 image: 랜디.jpg */
				const image = await Image.create({ src: req.body.image })
				await post.addImages(image)
			}
		}

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
		console.error(err)
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

/* POST /post/images */
router.post('/images', isLoggedIn, upload.array(/* input name */ 'image'), (req, res, next) => {
	console.log(req.files)
	res.json(req.files.map((file) => `http://localhost:3065/images/${file.filename}`))
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
