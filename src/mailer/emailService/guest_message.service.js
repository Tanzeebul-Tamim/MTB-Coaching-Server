const moment = require("moment");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

const auth = {
    auth: {
        api_key: process.env.EMAIL_PRIVATE_KEY,
        domain: process.env.EMAIL_DOMAIN,
    },
};

// Sets up email transporter
const transporter = nodemailer.createTransport(mg(auth));

// Load the HTML template once
const templatePath = path.join(__dirname, "../templates/guestMessage.html");

const source = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(source);

// send payment confirmation email
const sendGuestMessageEmail = (message) => {
    const { name, email, subject, date, message: text } = message;
    const format = "Do MMMM, YYYY";

    const replacements = {
        currentDate: moment(date).format(format),
        name,
        email,
        subject,
        message: text,
    };

    const htmlToSend = template(replacements);
    const textToSend = `
    Hi Admin,

    You have received a new message from a guest user via the MTB Coaching Network contact form.

    Details:
    - Name: ${name}
    - Email: ${email}
    - Subject: ${subject}
    - Date: ${moment(date).format(format)}

    Message:
    ${text}

    Please follow up with the user at your earliest convenience.

    Warm regards,
    MTB Club Contact System
    `;

    transporter.sendMail(
        {
            from: process.env.MAIL_SENDER,
            to: process.env.MAIL_SENDER, // Send to admin
            subject: `New Contact Message from ${name} (${email})`,
            html: htmlToSend,
            text: textToSend,
        },
        function (error, info) {
            if (error) {
                console.error(
                    "Failed to send guest contact message email:",
                    error
                );
            } else {
                console.log("Email sent: " + info.response);
            }
        }
    );
};

module.exports = { sendGuestMessageEmail };
