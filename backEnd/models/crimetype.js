'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CrimeType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CrimeType.belongsTo(models.CrimeCategory, {
        foreignKey: 'category_id',
        as: 'crimeCategory'
      });
    }
  }

  CrimeType.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    severity_level: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CrimeCategories', 
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'CrimeType',
    timestamps: false
  });

  return CrimeType;
};
