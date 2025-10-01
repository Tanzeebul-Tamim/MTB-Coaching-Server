const app = require("./app");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

const path = require("path");
const mailerPath = path.join(__dirname, "./mailer/emailService");

const { sendPaymentConfirmationEmail } = require(path.join(
    mailerPath,
    "receipt.service"
));
const { sendUserMessageEmail } = require(path.join(
    mailerPath,
    "user_message.service"
));
const { sendGuestMessageEmail } = require(path.join(
    mailerPath,
    "guest_message.service"
));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y70m6ei.mongodb.net/?retryWrites=true&w=majority`;
const port = process.env.PORT || 5000;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const db = client.db("PMBIA");
        const userCollection = db.collection("users");
        const bookingsCollection = db.collection("bookings");
        const messagesCollection = db.collection("messages");

        const test = await userCollection.findOne({});
        if (!test)
            console.warn(
                "⚠️ DB might be connected but user collection is empty or inaccessible."
            );

        //! --- START: Monthly Refresh Setup ---
        const { refreshCourses } = require("../scripts/updateClassDate");

        let hasRunThisMonth = false;

        function checkMonthlyRefresh() {
            const now = new Date();

            // Run only on the 1st day of the month at 2 AM
            if (
                now.getDate() === 1 &&
                now.getHours() === 2 &&
                !hasRunThisMonth
            ) {
                refreshCourses().catch((err) => {
                    console.error("Error updating instructor classes:", err);
                }); // this will update the DB
                hasRunThisMonth = true;
                console.log(
                    "Monthly refresh executed at",
                    now.toLocaleString()
                );
            }

            // Reset for next month on 2nd day
            if (now.getDate() === 2) {
                hasRunThisMonth = false;
            }
        }

        // check every 15 mins (Uptime Robot ping)
        setInterval(checkMonthlyRefresh, 15 * 60 * 1000);
        //! --- END: Monthly Refresh Setup ---

        // Register routes
        require("./routes/users")(app, userCollection);
        require("./routes/instructors")(
            app,
            userCollection,
            bookingsCollection
        );
        require("./routes/classes")(app, userCollection);
        require("./routes/messages")(
            app,
            messagesCollection,
            sendUserMessageEmail,
            sendGuestMessageEmail
        );
        require("./routes/bookings")(
            app,
            userCollection,
            bookingsCollection,
            stripe,
            sendPaymentConfirmationEmail
        );

        // Health check
        app.get("/", (_req, res) => {
            res.send(`MTB-Coaching-Server is active on port: ${port}`);
        });

        app.listen(port, () => {
            console.log(`MTB-Coaching-Server is running on port: ${port}`);
        });

        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
