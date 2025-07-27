// User-related routes
module.exports = (app, userCollection) => {
    // save user in db
    app.put("/users/:email", async (req, res) => {
        try {
            const fields = [
                "name",
                "image",
                "email",
                "gender",
                "contactNo",
                "address",
                "role",
                "quote",
                "cover",
                "classes",
            ];
            const email = req.params.email;
            const user = req.body;
            const query = { email };
            const options = { upsert: true };
            let updateDoc = {};

            fields.forEach((field) => {
                if (field === "classes") {
                    if (Array.isArray(user[field]))
                        updateDoc[field] = user[field];
                } else if (user[field] !== undefined) {
                    updateDoc[field] = user[field];
                }
            });

            updateDoc.classes = updateDoc.classes?.map((classItem) => {
                return {
                    ...classItem,
                    startDate: new Date(classItem.startDate),
                    endDate: new Date(classItem.endDate),
                };
            });

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
        res.json(result);
    });
};
