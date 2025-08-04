const { ObjectId } = require("mongodb");

// Message-related routes
module.exports = (
    app,
    messagesCollection,
    sendUserMessageEmail,
    sendGuestMessageEmail
) => {
    // save messages in db
    app.post("/messages", async (req, res) => {
        try {
            const message = req.body;

            if (message.authenticated) {
                message.userId = new ObjectId(message.userId);
            }

            message.date = new Date();

            const result = await messagesCollection.insertOne(message);

            if (message.authenticated) sendUserMessageEmail(message);
            else sendGuestMessageEmail(message);

            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error posting message.");
        }
    });
};
