const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Define message options
  const message = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send mail
  try {
    const info = await transporter.sendMail(message);
    console.log(`Email Sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email Sending Failed: ${error.message}`);
    // We catch the error but don't crash, so the main API flow is not blocked if mail server is offline
    return null;
  }
};

module.exports = sendEmail;
