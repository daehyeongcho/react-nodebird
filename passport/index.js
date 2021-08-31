const passport = require('passport')

const local = require('./local')
const { User } = require('../models')

module.exports = () => {
	/* serializeUser : req.login과 함께 실행 */
	passport.serializeUser((user, done) => {
		done(null, user.email) // 쿠키랑 묶어줄 정보(사용자 id)만 저장
	})

	/* deserializeUser : 로그인 성공 후 그 다음 요청부터 매번 실행 */
	passport.deserializeUser(async (email, done) => {
		try {
			const user = await User.findOne({ where: { email } }) // email를 받아서 DB로부터 사용자 정보를 복구해냄.
			done(null, user) // req.user에 넣어줌
		} catch (err) {
			console.error(err)
			done(err)
		}
	})

	local() // 로컬 로그인 정책 실행
}
