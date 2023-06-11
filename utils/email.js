const nodemailer = require("nodemailer");
const catchAsync = require("./catchAsync");

const sendEmail = catchAsync( async (options) => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d0f69334083983",
      pass: "019857864d2268"
    }
  });

  const mailOptions = {
    from: "Dheeraj Kumar <dkjoshi@infotrek.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailOptions);
});

module.exports = sendEmail;