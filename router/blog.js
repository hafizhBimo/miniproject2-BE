const routes = require("express").Router();
const { blog: blogController, like: likeController } = require("../controller");
const authMiddleware = require("../middleware/auth");
const multerUpload = require("../middleware/multer");

routes.get("/all", blogController.getAllBlog);
routes.get("/liked", authMiddleware.verifyToken, likeController.getLikedBlog);
routes.get("/yourBlog", authMiddleware.verifyToken, blogController.getYourBlog);
routes.post(
  "/write",
  authMiddleware.verifyToken,
  multerUpload.single("file"),
  blogController.createBlog
);
routes.post("/like/:id", authMiddleware.verifyToken, likeController.like);
routes.patch("/unlike/:id", authMiddleware.verifyToken, likeController.unlike);
routes.get("/singlePage/:id", blogController.singlePage);
routes.get("/mostLiked", blogController.favoriteBlog);

module.exports = routes;
