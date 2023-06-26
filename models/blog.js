"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Blog.belongsTo(models.user, {
        foreignKey: "authorID",
      });
      Blog.hasMany(models.like, {
        foreignKey: "blogID",
      });
    }
  }
  Blog.init(
    {
      title: DataTypes.STRING,
      authorID: DataTypes.STRING,
      imgURL: {
        type: DataTypes.STRING,
        // get() {
        //   const rawValue = this.getDataValue("imageURL");
        //   if (rawValue) {
        //     return convertFromDBtoRealPath(rawValue);
        //   }
        //   return null;
        // },
      },
      category: DataTypes.ENUM(
        "Umum",
        "Olahraga",
        "Ekonomi",
        "Politik",
        "Bisnis",
        "Fiksi"
      ),
      content: DataTypes.STRING,
      videoURL: DataTypes.STRING,
      keywords: DataTypes.STRING,
      country: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  return Blog;
};
