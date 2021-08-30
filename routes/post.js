const express = require('express')
const router = express.Router()

/* POST /post/ */
router.post('/', (req, res) => {
	res.json({ id: 1, content: 'hello' })
})

/* DELETE /posts/ */
router.delete('/', (req, res) => {
	res.send('delete complete')
})

module.exports = router
