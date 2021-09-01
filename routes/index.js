const express = require('express')
const router = express.Router()

const postRouter = require('./post')
const postsRouter = require('./posts')
const userRouter = require('./user')

/* GET / */
router.get('/', (req, res) => {
	res.send('hello express')
})

router.use('/post', postRouter)
router.use('/posts', postsRouter)
router.use('/user', userRouter)

module.exports = router
