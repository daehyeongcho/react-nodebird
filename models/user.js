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
				/* email을 아이디로 쓰기 때문에 id 대신 email을 primaryKey로 설정함 */
				email: {
					type: DataTypes.TEXT,
					primaryKey: true,
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
				sequelize, // index에서 선언한 Sequelize 객체
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
		db.User.belongsToMany(db.Post, {
			through: 'Like',
			as: 'Liked',
		}) // 유저:트윗좋아요 = N:M 관계
		db.User.belongsToMany(db.User, {
			through: 'Follow',
			as: 'Followers', // 같은 테이블끼리 N:M 관계면 구별을 위해 as로 구별. Javascript 객체에서 사용할 이름.
			foreignKey: 'FollowingEmail', // DB컬럼명: 반대로 쓰는 이유는 foreignKey가 남의 테이블 id를 가리키기 때문
		}) // 유저:팔로워 = N:M 관계
		db.User.belongsToMany(db.User, {
			through: 'Follow',
			as: 'Followings',
			foreignKey: 'FollowerEmail',
		}) // 유저:팔로잉 = N:M 관계
	}
}
