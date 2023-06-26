const transporter = require("../helper/transporter");
const db = require("../models");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const handlebars = require("handlebars");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { user } = db;

const secretKey = process.env.JWT_KEY;

module.exports = {
  async registerUser(req, res) {
    try {
      const { username, email, phone, password, confirmPassword } = req.body;

      //generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // generate random verification
      const verifyToken = crypto.randomBytes(16).toString("hex");
      const time = new Date();

      // check duplicate
      const isExist = await user.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ username }, { email }, { phone }],
        },
      });

      if (isExist) {
        return res.status(400).send({
          message: "username/email/phone is already registered",
        });
      }

      //create new user
      const userData = await user.create({
        username,
        email,
        phone,
        password: hashPassword,
        verifyToken,
        verifyTokenCreatedAt: time,
      });

      // render template email
      const link = `${process.env.FE_BASEPATH}/verify/${verifyToken}`;
      const data = fs.readFileSync("./template/templateRegister.html", "utf-8");
      const tempCompile = handlebars.compile(data);
      const tempResult = tempCompile({ username, link });

      await transporter.sendMail({
        from: "meToYou",
        to: email,
        subject: "thankyou for registering",
        html: tempResult,
      });
      res.status(200).json({ message: "register success", data: userData });
    } catch (error) {
      res.status(500).json({
        message: "something wrong in the server",
        errors: error.message,
      });
    }
  },
  async login(req, res) {
    try {
      const { userIdentification, password } = req.body;

      //validation user

      const userData = await user.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { username: userIdentification },
            { email: userIdentification },
            { phone: userIdentification },
          ],
        },
      });
      if (!userData) {
        return res.status(404).send({
          message: "login failed, incorrect login credentials",
        });
      }

      //hash password validation
      const isValid = await bcrypt.compare(password, userData.password);
      if (!isValid) {
        return res.status(404).send({
          message: "login failed, incorrect password",
        });
      }

      //generate token authorization
      const payload = { id: userData.id, username: userData.username };
      const token = jwt.sign(payload, secretKey);

      res.status(200).send({
        message: "login succeed",
        data: userData,
        loginToken: token,
      });
    } catch (error) {
      res.status(500).json({
        message: "something wrong in the server",
        errors: error.message,
      });
    }
  },

  async verify(req, res) {
    const token = req.body.verifyToken;
    try {
      const userData = await user.findOne({
        where: {
          verifyToken: token,
        },
      });

      if (!userData) {
        return res.status(400).send({
          message: "verification failed, invalid token",
        });
      }

      if (userData.isVerify) {
        return res.status(400).send({
          message: "user already verified",
        });
      }

      //set verified status on DB
      userData.isVerify = true;
      userData.verifyToken = null;
      userData.verifyTokenCreatedAt = null;
      await userData.save();

      res.status(200).send({
        message: "verify success",
        data: userData,
      });
    } catch (error) {
      res.status(500).send({
        message: "something wrong in the server",
        error: error.message,
      });
    }
  },
  async forgotPass(req, res) {
    const { email } = req.body;
    try {
      const userData = await db.user.findOne({ where: { email } });

      // generate forgot token
      const forgotToken = crypto.randomBytes(16).toString("hex");
      const time = new Date();

      // render template html email
      const username = userData.username;
      const link = `${process.env.FE_BASEPATH}/reset-pass/${forgotToken}`;
      const template = fs.readFileSync(
        "./template/templateForgot.html",
        "utf-8"
      );
      const templateCompile = handlebars.compile(template);
      const htmlResult = templateCompile({ username, link });
      // send email
      await transporter.sendMail({
        from: "me to you",
        to: email,
        subject: "meToYou - Forgot Password",
        html: htmlResult,
      });

      // save token to db
      userData.forgotToken = forgotToken;
      userData.forgotTokenCreatedAt = time;
      await userData.save();

      res.send({
        message: "please check your email!",
      });
    } catch (error) {
      res.status(404).send({ message: "user not found", error: error.message });
    }
  },
  async reset(req, res) {
    const { token, password, confirmPassword } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          forgotToken: token,
        },
      });
      if (!userData) {
        return res.status(400).send({ message: "token is not valid" });
      }

      // check token expiration
      const tokenCA = new Date(userData.forgotTokenCreatedAt);
      const now = new Date();
      tokenCA.setHours(tokenCA.getHours() + 1);

      if (now > tokenCA) {
        return res.status(400).send({
          message: "token is already expired",
        });
      }

      // generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      userData.password = hashPassword;
      userData.forgotToken = null;
      userData.forgotTokenCreatedAt = null;
      await userData.save();
      res.send({
        message: "password is resetted, try to login now!",
      });
    } catch (errors) {
      console.error(errors);
      res.status(500).send({
        message: "fatal error on server",
        error: errors.message,
      });
    }
  },
};
