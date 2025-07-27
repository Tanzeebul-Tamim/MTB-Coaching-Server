const { ObjectId } = require("mongodb");

// Booking and payment routes
module.exports = (
    app,
    userCollection,
    bookingsCollection,
    stripe,
    sendPaymentConfirmationEmail
) => {
    // post a booking
    app.put("/book-class", async (req, res) => {
        const {
            studentId,
            instructorId,
            studentEmail,
            studentName,
            classIndex,
            paymentStatus,
            transactionId,
            startDate,
            endDate,
            date,
        } = req.body;
        const query = {
            _id: new ObjectId(instructorId),
            role: "Instructor",
        };
        const options = { upsert: true };
        const instructor = await userCollection.findOne(query);
        const selectedClass = instructor?.classes[classIndex];
        const booking = {
            studentId: new ObjectId(studentId),
            studentEmail,
            studentName,
            instructorName: instructor?.name,
            instructorId: instructor?._id,
            "class-name": selectedClass?.name,
            classImage: selectedClass?.image,
            classFee: selectedClass?.price,
            paymentStatus,
            classIndex,
            transactionId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            date,
        };
        
        const updateDoc = { $set: booking };
        const result = await bookingsCollection.updateOne(
            {
                "class-name": selectedClass.name,
                studentId: new ObjectId(studentId),
                instructorId: new ObjectId(instructorId),
                classIndex,
            },
            updateDoc,
            options
        );
        // send confirmation email
        if (paymentStatus == "paid") {
            sendPaymentConfirmationEmail(
                req.body,
                selectedClass.name,
                instructor.name,
                selectedClass.price,
                booking.startDate,
                booking.endDate
            );
        }
        res.send(result);
    });

    // get user bookings
    app.get("/book-class/:studentId", async (req, res) => {
        const { studentId } = req.params;
        const query = { studentId: new ObjectId(studentId) };
        const bookings = await bookingsCollection.find(query).toArray();
        res.send(bookings);
    });

    // get a booking
    app.get("/book-class/:loggedId/:studentId/:itemId", async (req, res) => {
        const { loggedId, studentId, itemId } = req.params;
        if (loggedId == studentId) {
            const query = {
                studentId: new ObjectId(studentId),
                _id: new ObjectId(itemId),
            };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        } else {
            res.send(booking);
        }
    });

    // delete a booking
    app.delete("/book-class/:studentId", async (req, res) => {
        const { studentId } = req.params;
        const { instructorId, classIndex } = req.body;
        const query = {
            instructorId: new ObjectId(instructorId),
            classIndex,
            studentId: new ObjectId(studentId),
        };
        const result = await bookingsCollection.deleteOne(query);
        res.send(result);
    });

    // delete all bookings of a user
    app.delete("/booking/:studentId", async (req, res) => {
        const { studentId } = req.params;
        const query = {
            studentId: new ObjectId(studentId),
            paymentStatus: "unpaid",
        };
        const result = await bookingsCollection.deleteMany(query);
        res.send(result);
    });

    // create payment intent
    app.post("/create-payment-intent", async (req, res) => {
        const { price } = req.body;
        if (!price) return res.status(400).send("Price missing");
        const amount = parseFloat(price) * 100;
        if (!price) return;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ["card"],
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    });
};
