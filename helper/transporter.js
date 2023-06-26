const nodemailer = require("nodemailer");
require("dotenv").config();

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hafizhbimow@gmail.com",
    pass: process.env.PASS_RAHASIA,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
