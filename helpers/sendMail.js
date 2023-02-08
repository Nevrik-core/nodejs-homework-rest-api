const nodemailer = require("nodemailer");
require("dotenv").config();

const { SENDERS_MAIL, MAILTRAP_USER, MAILTRAP_PASSWORD } = process.env;


const sendMail = async (email, verificationToken) => {
    console.log("email", email)
    const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USER,
    pass: MAILTRAP_PASSWORD
  }
});

    const mail = {
        to: email,
        from: SENDERS_MAIL,
        subject: 'Please, confirm email',
        text: 'Please click on this link to confirm your email',
        html: `<a href="http://localhost:3000/api/users/verify/${verificationToken}">Confirm email</a>`,
    }
    try {
        const response = await transport.sendMail(mail);
        console.log(response);
    } catch (error) {
        console.log("bad request", error);

    }

}
    module.exports = sendMail;