// Script to randomize instructor class dates for demo purposes
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y70m6ei.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

//! Run 'npm status' to execute this script and update the class dates

function randomStartDate() {
    // Range: 40 days in the past to 30 days in the future
    const pastRange = 40;
    const futureRange = 30;
    const now = Date.now();
    const start = now - pastRange * 24 * 60 * 60 * 1000;
    const end = now + futureRange * 24 * 60 * 60 * 1000;
    return new Date(start + Math.random() * (end - start));
}

function randomEndDate(startDate) {
    const min = 3,
        max = 30;
    const offset = Math.floor(Math.random() * (max - min + 1)) + min;
    const result = new Date(startDate);
    result.setDate(result.getDate() + offset);
    return result;
}

async function updateClassDate() {
    await client.connect();
    const db = client.db("PMBIA");
    const users = db.collection("users");

    const instructors = await users.find({ role: "Instructor" }).toArray();

    for (const instructor of instructors) {
        const updatedClasses = (instructor?.classes || []).map((cls) => {
            const startDate = randomStartDate();
            const endDate = randomEndDate(startDate);
            return { ...cls, startDate, endDate };
        });

        await users.updateOne(
            { _id: instructor._id },
            { $set: { classes: updatedClasses } }
        );
    }

    console.log("Instructor classes updated!");
    await client.close();
}

updateClassDate().catch((err) => {
    console.error("Error updating instructor classes:", err);
    client.close();
});
