require("dotenv").config();
const nodemailer = require('nodemailer');

const servizioMail=nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADDR,
        pass: process.env.EMAIL_PSW
    }
});

module.exports={servizioMail};