const express = require('express')
const router = express.Router()

const postRouter = require('./post')
const userRouter = require('./user')

router.get('/', (req, res) => {
	res.send('hello express')
})

router.get('/posts', (req, res) => {
	res.json([
		{ id: 1, content: 'hello' },
		{ id: 2, content: 'hello2' },
		{ id: 3, content: 'hello3' },
	])
})

router.use('/post', postRouter)
router.use('/user', userRouter)

module.exports = router
