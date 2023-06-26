"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.Blog, {
        foreignKey: "authorID",
      });
      user.hasMany(models.like,{
        foreignKey:"userID"
      })
    }
  }
  user.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      imgProfile: DataTypes.STRING,
      isVerify: DataTypes.BOOLEAN,
      verifyToken: DataTypes.STRING,
      verifyTokenCreatedAt: DataTypes.DATE,
      forgotToken: DataTypes.STRING,
      forgotTokenCreatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};
