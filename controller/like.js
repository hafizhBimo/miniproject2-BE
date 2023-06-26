const db = require("../models");

module.exports = {
  async like(req, res) {
    const blogID = req.params.id;
    const userID = req.user.id;
    const userData = await db.user.findOne({
      where: { id: userID },
    });
    try {
      //check if user verified
      if (!userData.isVerify) {
        return res.status(400).send({
          message: "user is not verified",
        });
      }
      //check if blog exist
      const isExist = await db.Blog.findOne({
        where: { id: blogID },
      });
      if (!isExist) {
        return res.status(404).send({
          message: "blog not found",
        });
      }

      //check duplicate
      const isLiked = await db.like.findOne({
        where: { [db.Sequelize.Op.and]: [{ userID }, { blogID }] },
      });
      if (isLiked) {
        return res.status(400).send({
          message: "you've already liked this blog",
        });
      }
      const likeData = await db.like.create({
        userID,
        blogID,
      });
      res.status(200).send({
        message: "like success",
        likeData,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error.message,
      });
    }
  },

  async unlike(req, res) {
    const blogID = req.params.id;
    const userID = req.user.id;
    try {
      //check if blog exist
      const isExist = await db.Blog.findOne({
        where: { id: blogID },
      });
      if (!isExist) {
        return res.status(404).send({
          message: "blog not found",
        });
      }

      //check duplicate
      const isLiked = await db.like.findOne({
        where: { [db.Sequelize.Op.and]: [{ userID }, { blogID }] },
      });
      if (!isLiked) {
        return res.status(400).send({
          message: "you haven't liked this blog before",
        });
      }

      //delete data
      const deletedData = await db.like.destroy({
        where: { [db.Sequelize.Op.and]: [{ userID }, { blogID }] },
      });
      res.status(200).send({
        message: "unlike success",
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error.message,
      });
    }
  },

  async getLikedBlog(req, res) {
    const userID = req.user.id;
    try {
      const blogData = await db.like.findAll({
        where: {
          userID,
        },
        include: db.Blog,
      });

      res.status(200).send({
        message: "blogs you've liked",
        blogData,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error",
        errors: error.message,
      });
    }
  },
};
