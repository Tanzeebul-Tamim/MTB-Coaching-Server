// User-related routes
module.exports = (app, userCollection) => {
    // save user in db
    app.put("/users/:email", async (req, res) => {
        try {
            const email = req.params.email;
            const user = req.body;
            const query = { email: email };
            const options = { upsert: true };
            let updateDoc = {};
            if (user.name) updateDoc.name = user.name;
            if (user.image) updateDoc.image = user.image;
            if (user.email) updateDoc.email = user.email;
            if (user.gender) updateDoc.gender = user.gender;
            if (user.contactNo) updateDoc.contactNo = user.contactNo;
            if (user.address) updateDoc.address = user.address;
            if (user.role) updateDoc.role = user.role;
            if (user.quote) updateDoc.quote = user.quote;
            if (user.cover) updateDoc.cover = user.cover;
            const result = await userCollection.updateOne(
                query,
                { $set: updateDoc },
                options
            );
            res.send(result);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error updating user data.");
        }
    });

    // get user from db
    app.get("/users/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await userCollection.findOne(query);
        res.send(result);
    });
};
