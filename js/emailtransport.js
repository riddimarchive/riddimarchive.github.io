const nodemailer = require('nodemailer');

// return email transport
function createTransport(){
	let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: `${process.env.EMAIL}`, 
          pass: `${process.env.EMAIL_PASSWORD}` 
        }
      });
	return transporter;
}

module.exports = createTransport;
