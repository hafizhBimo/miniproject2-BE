const db = require("../models");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const handlebars = require("handlebars");
const transporter = require("../helper/transporter");
const {
  setFromFileNameToDBValue,
  getAbsolutePathPublicFile,
  getFilenameFromDbValue,
} = require("../utils/file");

module.exports = {
  async getProfile(req, res) {
    try {
      const user = await db.user.findOne({
        where: {
          id: req.user.id,
        },
      });
      res.send({ message: "get profile success", data: user });
    } catch (error) {
      res.status(500).send({ message: "fatal error on server", error });
    }
  },
  async changePassword(req, res) {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          id: req.user.id,
        },
      });

      //compare oldPass to db
      const oldPassValid = await bcrypt.compare(oldPassword, userData.password);
      if (!oldPassValid) {
        return res.status(404).send({
          message: "incorrect old password",
        });
      }

      //compare newPass to confirmPass
      if (confirmNewPassword !== newPassword) {
        return res.status(400).send({
          messasge: "confirm Password didn't match",
        });
      }

      //generate password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);

      //change password
      userData.password = hashPassword;
      await userData.save();
      res.status(200).send({
        message: "your password has been changed",
        data: userData,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "fatal error on server", error: error.message });
    }
  },

  async changeUsername(req, res) {
    const { newUsername } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          id: req.user.id,
        },
      });

      //check duplicate
      const isExist = await db.user.findOne({
        where: {
          username: newUsername,
        },
      });

      if (isExist) {
        return res.status(400).send({
          message: "username already exist",
        });
      }

      //update username
      userData.username = newUsername;
      await userData.save();

      res.status(200).send({
        message: "username changed",
        userData,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "fatal error on server", error: error.message });
    }
  },
  async changeEmail(req, res) {
    const { newEmail } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          id: req.user.id,
        },
      });

      //check duplicate
      const isExist = await db.user.findOne({
        where: {
          email: newEmail,
        },
      });
      if (isExist) {
        return res.status(400).send({
          message: "email already registered",
        });
      }

      // generate random verification
      const verifyToken = crypto.randomBytes(16).toString("hex");
      const time = new Date();

      // render template email
      const link = `${process.env.FE_BASEPATH}/${verifyToken}`;
      const data = fs.readFileSync(
        "./template/templateChangeEmail.html",
        "utf-8"
      );
      const username = userData.username;
      const tempCompile = handlebars.compile(data);
      const tempResult = tempCompile({ username, link });

      await transporter.sendMail({
        from: "halo mas",
        to: userData.email,
        subject: "change email confirmation",
        html: tempResult,
      });

      //update email
      userData.email = newEmail;
      //update verified status on db
      userData.isVerify = false;
      userData.verifyToken = verifyToken;
      userData.verifyTokenCreatedAt = time;
      await userData.save();

      res
        .status(200)
        .json({ message: "your email has been changed", data: userData });
    } catch (error) {
      res.status(500).send({
        message: "something wrong in the server",
        error: error.message,
      });
    }
  },
  async changePhoneNumber(req, res) {
    const { newPhone } = req.body;
    try {
      const userData = await db.user.findOne({
        where: {
          id: req.user.id,
        },
      });

      //check duplicate
      const isExist = await db.user.findOne({
        where: {
          phone: newPhone,
        },
      });
      if (isExist) {
        return res.status(400).send({
          message: "phone number already registered",
        });
      }

      //update phone number
      userData.phone = newPhone;
      await userData.save();
      res.status(200).send({
        message: "your phone number has been updated",
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error",
        error: error.message,
      });
    }
  },

  async changeProfilePicture(req, res) {
    const userId = req.user.id;
    try {
      const userData = await db.user.findOne({ where: { id: userId } });

      if (req.file) {
        if (userData.imgProfile !== null) {
          const realimageURL = userData.getDataValue("imgProfile");
          const oldFilename = getFilenameFromDbValue(realimageURL);
          if (oldFilename) {
            fs.unlinkSync(getAbsolutePathPublicFile(oldFilename));
          }
        }
        userData.imgProfile = setFromFileNameToDBValue(req.file.filename);
      }

      await userData.save();

      res.send({
        message: "successfully uploaded picture",
        data: userData,
      });
    } catch (error) {
      res.status(500).send({
        message: "fatal error on server",
        errors: error.message,
      });
    }
  },
};
