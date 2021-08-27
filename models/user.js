const DataTypes = require('sequelize')
const { Model } = DataTypes

/** 사용자 정보 모델
 * - email: 아이디 대신 쓰기 때문에 unique: true
 * - nickname: 닉네임
 * - password: 비밀번호
 */
module.exports = class User extends Model {
	static init(sequelize) {
		return super.init(
			{
				/* id: 기본으로 들어있다. */
				email: {
					type: DataTypes.TEXT,
					allowNull: false,
					unique: true,
				},
				nickname: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
				password: {
					type: DataTypes.TEXT,
					allowNull: false,
				},
			},
			{
				sequelize, // sequelize: sequelize
				timestamps: true, // 기록 시간 남기기
				underscored: false, // camelCase -> camel_case
				modelName: 'User', // 모델명
				tableName: 'users', // 테이블명
				paranoid: true, // 실제로 db에서 삭제하지 않고 deleted_at 남김
				charset: 'utf8mb4',
				collate: 'utf8mb4_general_ci', // 이모티콘 저장
			},
		)
	}

	static associate(db) {
		db.User.hasMany(db.Post) // 유저:트윗 = 1:N 관계
		db.User.hasMany(db.Comment) // 유저:댓글 = 1:N 관계
		db.User.hasMany(db.Post, {
			through: 'Like',
		}) // 유저:트윗좋아요 = N:M 관계
	}
}
