/* req.isAuthenticated: passport 모듈에서 제공함. */

exports.isLoggedIn = (req, res, next) => {
	/* 로그인되어 있으면 */
	if (req.isAuthenticated()) {
		next() // 문제 없이 다음으로 넘어감
	} else {
		res.status(401).send('로그인이 필요합니다.')
	}
}

exports.isNotLoggedIn = (req, res, next) => {
	/* 로그인되어 있지 않으면 */
	if (!req.isAuthenticated()) {
		next() // 문제 없이 다음으로 넘어감
	} else {
		res.status(401).send('로그인하지 않은 사용자만 접근 가능합니다.')
	}
}
