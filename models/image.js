const DataTypes = require('sequelize')
const { Model } = DataTypes

/** 이미지 경로 모델
 */
module.exports = class Image extends Model {
	static init(sequelize) {
		return super.init(
			{
				/* id: 기본으로 들어있다. */
				src: {
					type: DataTypes.TEXT,
					allowNull: false, // 필수
				},
			},
			{
				sequelize,
				timestamps: true,
				underscored: false,
				modelName: 'Image',
				tableName: 'images',
				paranoid: true,
				charset: 'utf8mb4',
				collate: 'utf8mb4_general_ci', // 이모티콘 저장
			},
		)
	}

	static associate(db) {
		db.Image.belongsTo(db.Post) // 트윗:이미지 = 1:N 관계
	}
}
