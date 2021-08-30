const passport = require('passport')
const { Strategy: LocalStrategy } = require('passport-local')
const bcrypt = require('bcrypt')

const { User } = require('../models')

module.exports = () => {
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'email', // req.body.email
				passwordField: 'password', // req.body.password
			},
			/* 위에서 설정한 Field 그대로 parameter로 들어감 */
			async (email, password, done) => {
				try {
					const user = await User.findOne({ where: { email } }) // 이메일 유저가 존재하는지
					if (!user) {
						return done(null, false, { reason: '존재하지 않는 사용자입니다.' }) // 패러미터: (서버에러, 성공, 클라이언트에러)
					}

					const result = await bcrypt.compare(password, user.password) // 비밀번호 비교
					if (result) {
						return done(null, user) // 비밀번호 일치하면 유저 정보 넘겨줌
					}
					return done(null, false, { reason: '비밀번호가 틀렸습니다.' }) // 비밀번호가 일치하지 않음.
				} catch (err) {
					/* 서버 에러 */
					console.error(err)
					return done(err)
				}
			},
		),
	)
}
