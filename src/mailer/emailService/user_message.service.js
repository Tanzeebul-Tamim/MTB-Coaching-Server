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
const templatePath = path.join(__dirname, "../templates/userMessage.html");

const source = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(source);

// send payment confirmation email
const sendUserMessageEmail = (message) => {
    const {
        name,
        email,
        image,
        subject,
        date,
        message: text,
        contactNo,
        address,
        role,
    } = message;
    const format = "Do MMMM, YYYY";

    const replacements = {
        currentDate: moment(date).format(format),
        name,
        image,
        email,
        subject,
        contactNo,
        address,
        message: text,
        role,
    };

    const htmlToSend = template(replacements);
    const textToSend = `
    Hi Admin,

    You have received a new message from a registered member of the MTB Coaching Network.

    Details:
    - Name: ${name}
    - Email: ${email}
    - Subject: ${subject}
    - Contact Number: ${contactNo || "-"}
    - Address: ${address || "-"}
    - Date: ${moment(date).format(format)}

    Message:
    ${text}

    Please follow up with the sender at your earliest convenience.

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
                    "Failed to send registered member contact message email:",
                    error
                );
            } else {
                console.log("Email sent: " + info.response);
            }
        }
    );
};

module.exports = { sendUserMessageEmail };
