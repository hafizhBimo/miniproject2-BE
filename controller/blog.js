const db = require("../models");
const fs = require("fs");
const { setFromFileNameToDBValue } = require("../utils/file");

module.exports = {
  async createBlog(req, res) {
    const { title, category, content, videoURL, keywords, country } = req.body;
    const imageURL = setFromFileNameToDBValue(req.file.filename);
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

      //create blog
      const newBlog = await db.Blog.create({
        title,
        authorID: userID,
        imgURL: imageURL,
        category,
        content,
        videoURL,
        keywords,
        country,
      });
      res.status(200).send({
        message: "blog successfully posted",
        newBlog,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },
  async getAllBlog(req, res) {
    const pagination = {
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 10,
      search: req.query.search || undefined,
      sortBy: req.query.sort || "createdAt",
      sortOrder: req.query.order || "desc",
      category: req.query.category || undefined,
      keywords: req.query.keywords || undefined,
      title: req.query.title || undefined,
    };

    try {
      let where = {};

      if (pagination.search) {
        where[db.Sequelize.Op.or] = [
          {
            "$user.username$": {
              [db.Sequelize.Op.like]: `%${pagination.search}%`,
            },
          },
          { keywords: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          { title: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
          { content: { [db.Sequelize.Op.like]: `%${pagination.search}%` } },
        ];
      }

      if (pagination.category) {
        where.category = pagination.category;
      }

      if (pagination.keywords) {
        where.keywords = { [db.Sequelize.Op.like]: `%${pagination.keywords}%` };
      }

      if (pagination.title) {
        where.title = { [db.Sequelize.Op.like]: `%${pagination.title}%` };
      }
      const { count, rows } = await db.Blog.findAndCountAll({
        where,
        include: [{ model: db.user, attributes: ["username"], as: "user" }],
        order: [[pagination.sortBy, pagination.sortOrder]],
        limit: pagination.perPage,
        offset: (pagination.page - 1) * pagination.perPage,
      });

      if (pagination.search && count === 0) {
        return res.status(404).send({
          message: "No blogs found matching the search query.",
        });
      }

      const totalPages = Math.ceil(count / pagination.perPage);

      res.send({
        message: "Successfully retrieved blogs.",
        pagination: {
          page: pagination.page,
          perPage: pagination.perPage,
          totalPages: totalPages,
          totalData: count,
        },
        data: rows,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({
        message: "An error occurred while processing the request.",
        error: error.message,
      });
    }
  },

  async getYourBlog(req, res) {
    const userID = req.user.id;
    try {
      const results = await db.Blog.findAll({
        where: { authorID: userID },
      });
      res.send({
        message: "success get blog from profile",
        data: results,
      });
    } catch (errors) {
      res.status(500).send({
        message: "fatal error on server",
        errors: errors.message,
      });
    }
  },
  async singlePage(req, res) {
    const blogID = req.params.id;
    try {
      const singlePage = await db.Blog.findOne({
        where: { id: blogID },
      });

      if (!singlePage) {
        return res.status(400).send({
          message: "blog not found",
        });
      }

      res.status(200).send({
        message: "single page blog",
        data: singlePage,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error",
        errors: error.message,
      });
    }
  },

  async favoriteBlog(req, res) {
    try {
      const mostLike = await db.like.findAll({
        attributes: [
          "blogID",
          [db.Sequelize.fn("COUNT", db.Sequelize.col("blogID")), "likeCount"],
        ],
        include: [
          {
            model: db.Blog,
            attributes: ["id", "title", "category"],
            as: "Blog",
            include: [
              {
                model: db.user,
                attributes: ["username"],
              },
            ],
          },
        ],
        group: ["blogID"],
        order: [[db.Sequelize.literal("likeCount"), "DESC"]],
        limit: 10,
      });

      res.status(201).send({
        message: "most favorite blog displayed",
        data: mostLike,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error.message,
      });
    }
  },
};
