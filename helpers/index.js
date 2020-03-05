const nodeMailer = require("nodemailer");

const defaultEmailData = { from: "noreply@node-react.com" };

exports.sendEmail = emailData => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // requireTLS: true,
    auth: {
      user: process.env.GMAIL, // generated ethereal user
      pass: process.env.GMAILPW // generated ethereal password
    },
    tls: {
      //这个是从localhost发邮件需要用的
      rejectUnauthorized: false
    }
  });

  return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message sent: ${info.response}`))
    .catch(err => console.log(`Problem sending email: ${err}`));
};
