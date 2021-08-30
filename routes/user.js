const express = require('express')
const bcrypt = require('bcrypt')
const { User } = require('../models')

const router = express.Router()

/* POST /user/ */
router.post('/', async (req, res, next) => {
	try {
		const { email, nickname } = req.body
		const exUser = await User.findOne({
			where: { email },
		})
		if (exUser) {
			return res.status(403).send('이미 사용중인 아이디입니다.') // status 400(사용자가 잘못 보냄)
		}

		const password = await bcrypt.hash(req.body.password, 10)
		const result = await User.create({
			email,
			nickname,
			password,
		})
		console.log(result)
		res.status(201).send('ok')
	} catch (err) {
		console.error(err)
		next(err) // status 500(서버 쪽 에러)
	}
})

module.exports = router
