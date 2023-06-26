const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_KEY;

module.exports = {
  // authentication
  async verifyToken(req, res, next) {
    // check is token exist
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).send({
        message: "token is not found",
      });
      return;
    }
    // token validation
    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, secretKey);
        if (!payload) {
          res.status(401).send({
            message: "token verification failed",
          });
          return;
        }
        req.user = payload;
        next();
      } catch (error) {
        res.status(401).send({
          message: "invalid token",
          error,
        });
      }
    }
  },
};
