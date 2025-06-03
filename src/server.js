const app = require("./app");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const { sendPaymentConfirmationEmail } = require("./email.service");

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
        // await client.connect();
        const userCollection = client.db("PMBIA").collection("users");
        const bookingsCollection = client.db("PMBIA").collection("bookings");

        // Register routes
        require("./routes/users")(app, userCollection);
        require("./routes/instructors")(app, userCollection, bookingsCollection);
        require("./routes/classes")(app, userCollection);
        require("./routes/bookings")(app, userCollection, bookingsCollection, stripe, sendPaymentConfirmationEmail);

        // Health check
        app.get("/", (_req, res) => {
            res.send(`MTB-Coaching-Server is active on port: ${port}`);
        });

        app.listen(port, () => {
            console.log(`MTB-Coaching-Server is running on port: ${port}`);
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
