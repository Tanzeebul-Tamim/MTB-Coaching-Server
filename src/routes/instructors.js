const { ObjectId } = require("mongodb");

// Instructor-related routes
module.exports = (app, userCollection) => {
    // get all instructors
    app.get("/instructors", async (req, res) => {
        const count = parseInt(req.query.count) || 0;
        const search = req.query.search;
        const query = search
            ? { role: "Instructor", name: { $regex: search, $options: "i" } }
            : { role: "Instructor" };
        const result = await userCollection.find(query).limit(count).toArray();
        res.send(result);
    });

    // get number of instructors
    app.get("/instructors/total", async (req, res) => {
        const query = { role: "Instructor" };
        const count = await userCollection.countDocuments(query);
        res.send({ totalInstructors: count });
    });

    // get top 6 instructors & get instructors with total students
    app.get("/instructors/top", async (req, res) => {
        const query = { role: "Instructor" };
        const instructors = await userCollection.find(query).toArray();
        const instructorsWithTotalStudents = instructors.map((instructor) => {
            const totalStudents = instructor?.classes?.reduce(
                (total, classItem) => total + classItem.totalStudent,
                0
            );
            return { ...instructor, totalStudents };
        });
        const sortedInstructors = instructorsWithTotalStudents.sort(
            (a, b) => b.totalStudents - a.totalStudents
        );
        const topInstructors = sortedInstructors.slice(0, 6);
        res.send({ topInstructors, instructorsWithTotalStudents });
    });

    // get single instructor
    app.get("/instructor/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id), role: "Instructor" };
        const result = await userCollection.findOne(query);
        res.send(result);
    });

    // update instructors available seat
    app.put("/instructor/updateStudentCount", async (req, res) => {
        const { instructorId, classIndex } = req.body;
        const query = {
            _id: new ObjectId(instructorId),
            role: "Instructor",
        };
        const instructor = await userCollection.findOne(query);
        let classItem = instructor.classes[classIndex];
        classItem.totalStudent += 1;
        const update = { $set: { classes: instructor.classes } };
        const result = await userCollection.updateOne(query, update);
        res.send(result);
    });
};
