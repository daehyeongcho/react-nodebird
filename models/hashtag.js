const DataTypes = require('sequelize')
const { Model } = DataTypes

/** 해쉬태그 모델
 * content: #을 제외한 해쉬태그(20자 이하)
 */
module.exports = class Hashtag extends Model {
	static init(sequelize) {
		return super.init(
			{
				/* id: 기본으로 들어있다. */
				content: {
					type: DataTypes.STRING(20),
					allowNull: false, // 필수
				},
			},
			{
				sequelize,
				timestamps: true,
				underscored: false,
				modelName: 'Hashtag',
				tableName: 'hashtags',
				paranoid: true,
				charset: 'utf8mb4',
				collate: 'utf8mb4_general_ci', // 이모티콘 저장
			},
		)
	}

	static associate(db) {
		db.Hashtag.belongsToMany(db.Post) // 트윗:해쉬태그 = N:M 관계
	}
}
