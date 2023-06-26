const { body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = {
  RegisterValidation: validate([
    body("username")
      .notEmpty()
      .withMessage("username is required")
      .isLength({ max: 50 })
      .withMessage("maximum  characters is 50"),
    body("email").isEmail(),
    body("phone").notEmpty(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("minimum length is 6 characters")
      .notEmpty()
      .isStrongPassword({
        minNumbers: 0,
      })
      .withMessage("password must contain min. 1 uppercase and 1 symbol")
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          return false;
        }
        return true;
      })
      .withMessage("confirm password is not match with password"),
  ]),
  validateEmail: validate([
    body("newEmail").isEmail().withMessage("email must be valid"),
  ]),

  validateResetPass: validate([
    body("token").notEmpty().withMessage("token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("minimum password length is 6 characters")
      .isStrongPassword({
        minNumbers: 0,
      })
      .withMessage(
        "password must contain atleast 1 uppercase letter and 1 symbol"
      )
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          return false;
        }
        return true;
      })
      .withMessage("confirm password is not match with password"),
  ]),

  validateChangePass: validate([
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("minimum password length is 6 characters")
      .isStrongPassword({
        minNumbers: 0,
      })
      .withMessage(
        "password must contain atleast 1 uppercase letter and 1 symbol"
      )
  ]),
  validateUsername: validate([
    body("newUsername")
      .notEmpty()
      .withMessage("username is required")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50"),
  ]),

  validatePhone: validate([
    body("newPhone").notEmpty().withMessage("phone number must not be empty"),
  ]),
};
