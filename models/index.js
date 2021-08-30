const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.Comment = require('./comment')
db.Hashtag = require('./hashtag')
db.Image = require('./image')
db.Post = require('./post')
db.User = require('./user')

/* 각 모델 초기화 */
Object.keys(db).forEach((modelName) => {
	db[modelName].init(sequelize)
})

/* 각 모델 별로 정의되어 있는 모델 간 관계 연결해줌. */
Object.keys(db).forEach((modelName) => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize

module.exports = db
