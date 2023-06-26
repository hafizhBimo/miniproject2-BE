const routes = require("express").Router();
const { auth: authController } = require("../controller");
const validationMiddleware = require("../middleware/validation");

routes.post(
  "/register",
  validationMiddleware.RegisterValidation,
  authController.registerUser
);
routes.patch("/verify", authController.verify);
routes.post("/login", authController.login);
routes.post("/forgotPass", authController.forgotPass);
routes.post(
  "/resetPass",
  validationMiddleware.validateResetPass,
  authController.reset
);

module.exports = routes;
