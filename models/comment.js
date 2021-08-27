const DataTypes = require('sequelize')
const { Model } = DataTypes

/** 댓글 모델
 * - content: 댓글 본문(TEXT)
 */
module.exports = class Comment extends Model {
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
				modelName: 'Comment',
				tableName: 'comments',
				paranoid: true,
				charset: 'utf8mb4',
				collate: 'utf8mb4_general_ci', // 이모티콘 저장
			},
		)
	}

	static associate(db) {
		db.Comment.belongsTo(db.Post) // 트윗:댓글 = 1:N 관계
		db.Comment.belongsTo(db.User) // 유저:댓글 = 1:N 관계
	}
}
