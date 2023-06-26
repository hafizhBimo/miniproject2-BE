const routes = require("express").Router();
const authMiddleware = require("../middleware/auth");
const { profile: profileController } = require("../controller");
const multerUpload = require("../middleware/multer");
const validationMiddleware = require("../middleware/validation");

routes.use(authMiddleware.verifyToken);
routes.get("/", profileController.getProfile);
routes.patch(
  "/changePassword",
  validationMiddleware.validateChangePass,
  profileController.changePassword
);
routes.patch(
  "/changeUsername",
  validationMiddleware.validateUsername,
  profileController.changeUsername
);
routes.patch(
  "/changeEmail",
  validationMiddleware.validateEmail,
  profileController.changeEmail
);
routes.patch(
  "/changePhoneNumber",
  validationMiddleware.validatePhone,
  profileController.changePhoneNumber
);
routes.patch(
  "/changeProfilePicture",
  multerUpload.single("file"),
  profileController.changeProfilePicture
);

module.exports = routes;
