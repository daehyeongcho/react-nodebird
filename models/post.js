const DataTypes = require('sequelize')
const { Model } = DataTypes

/** 트윗 모델
 * - content: 트윗 내용(TEXT)
 */
module.exports = class Post extends Model {
	static init(sequelize) {
		return super.init(
			{
				/* id: 기본으로 들어있다. */
				content: {
					type: DataTypes.TEXT,
					allowNull: false, // 필수
				},
			},
			{
				sequelize,
				timestamps: true,
				underscored: false,
				modelName: 'Post',
				tableName: 'posts',
				paranoid: true,
				charset: 'utf8mb4',
				collate: 'utf8mb4_general_ci', // 이모티콘 저장
			},
		)
	}

	static associate(db) {
		db.Post.belongsTo(db.User) // 유저:트윗 = 1:N 관계
		db.Post.hasMany(db.Comment) // 트윗:댓글 = 1:N 관계
		db.Post.hasMany(db.Image) // 트윗:이미지 = 1:N 관계
		db.Post.belongsToMany(db.Hashtag) // 트윗:해쉬태그 = N:M 관계
		db.Post.belongsToMany(db.User, {
			through: 'Like',
		}) // 유저:트윗좋아요 = N:M 관계
	}
}
