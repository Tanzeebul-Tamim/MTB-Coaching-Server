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
const templatePath = path.join(
    process.cwd(),
    "templates/paymentConfirmation.html"
);

const source = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(source);

// send payment confirmation email
const sendPaymentConfirmationEmail = (
    payment,
    className,
    instructorName,
    price
) => {
    const startDate = moment().add(7, "days");
    const endDate = moment(startDate).add(25, "days");
    const durationInDays = endDate.diff(startDate, "days");

    const replacements = {
        currentDate: moment(new Date()).format("Do MMMM, YYYY"),
        studentName: payment.studentName,
        className,
        instructorName,
        startDate: startDate.format("Do MMMM, YYYY"),
        endDate: endDate.format("Do MMMM, YYYY"),
        durationInDays,
        transactionId: payment.transactionId || "-",
        price,
        paymentDate: payment.date ? moment(payment.date).format("dddd, Do MMMM, YYYY, hh:mm a") : "-",
        studentEmail: payment.studentEmail,
    };

    const htmlToSend = template(replacements);
    const textToSend = `
Hi ${payment.studentName},

Thank you for enrolling in "${className}" by ${instructorName}.

Your course will start on ${startDate.format(
        "Do MMMM, YYYY"
    )} and will end on ${endDate.format(
        "Do MMMM, YYYY"
    )}, lasting ${durationInDays} days.

Payment Details:
- Transaction ID: ${payment.transactionId}
- Amount Paid: $${price}
- Payment Date: ${moment(payment.date).format("dddd, Do MMMM, YYYY, hh:mm a")}

We hope you enjoy your learning journey!

Warm regards,
MTB Club Team
`;

    transporter.sendMail(
        {
            from: process.env.MAIL_SENDER,
            to: payment.studentEmail,
            subject: "Thank you for your course purchase!",
            html: htmlToSend,
            text: textToSend,
        },
        function (error, info) {
            if (error) {
                console.error(
                    "Failed to send payment confirmation email:",
                    error
                );
            } else {
                console.log("Email sent: " + info.response);
            }
        }
    );
};

module.exports = { sendPaymentConfirmationEmail };
