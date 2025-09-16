'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CrimeCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CrimeCategory.hasMany(models.CrimeType, {
        foreignKey: 'category_id',
        as: 'crimeTypes'
      });
    }
  }

  CrimeCategory.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'CrimeCategory',
    timestamps: false
  });

  return CrimeCategory;
};
