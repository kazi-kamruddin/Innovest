'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Crime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Crime.belongsTo(models.CrimeType, {
        foreignKey: 'type_id',
        as: 'crimeType'
      });
    }
  }

  Crime.init({
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CrimeTypes',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Crime',
    timestamps: false
  });

  return Crime;
};
