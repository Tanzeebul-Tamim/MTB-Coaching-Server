const { ObjectId } = require("mongodb");
const { instructorRanking } = require("../utility/instructorRanking");

// Instructor-related routes
module.exports = (app, userCollection, bookingsCollection) => {
    // get all instructors with total students and proper ranking
    app.get("/instructors", async (req, res) => {
        const count = parseInt(req.query.count) || 0;
        const search = req.query.search || null;

        let instructors = await instructorRanking(
            userCollection,
            false,
            search
        );

        if (count > 0) {
            instructors = instructors.slice(0, count);
        }

        res.send(instructors);
    });

    // get number of instructors
    app.get("/instructors/total", async (req, res) => {
        const query = { role: "Instructor" };
        const count = await userCollection.countDocuments(query);
        res.send({ totalInstructors: count });
    });

    // get top 10 instructors & get instructors with total students
    app.get("/instructors/top", async (req, res) => {
        const instructors = await instructorRanking(userCollection, true);
        res.send(instructors);
    });

    // get total students of a specific instructor
    app.get("/instructor/total/:id", async (req, res) => {
        try {
            const { id } = req.params;

            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id),
                        role: "Instructor",
                    },
                },
                {
                    $project: {
                        totalStudents: {
                            $sum: {
                                $map: {
                                    input: "$classes",
                                    as: "cls",
                                    in: { $ifNull: ["$$cls.totalStudent", 0] },
                                },
                            },
                        },
                    },
                },
            ];

            const result = await userCollection.aggregate(pipeline).toArray();

            if (!result.length) {
                return res.status(404).json({ error: "Instructor not found" });
            }

            res.send({ totalStudents: result[0].totalStudents });
        } catch (err) {
            console.error("Aggregation error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // get student list of a specific course of a specific instructor
    app.get("/instructor/students/:id/:idx", async (req, res) => {
        const { id, idx } = req.params;

        try {
            const query = {
                instructorId: new ObjectId(id),
                paymentStatus: "paid",
                classIndex: parseInt(idx),
            };

            const bookings = await bookingsCollection.find(query).toArray();

            const students = await Promise.all(
                bookings.map(async (booking) => {
                    const { studentId } = booking;
                    const student = await userCollection.findOne({
                        _id: new ObjectId(studentId),
                    });
                    return student;
                })
            );

            const filteredStudents = students.filter(Boolean); // remove nulls
            res.send({ students: filteredStudents });
        } catch (error) {
            console.error("Error fetching students:", error);
            res.status(500).send({ error: "Internal server error" });
        }
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
        classItem.totalStudent++;
        const update = { $set: { classes: instructor.classes } };
        const result = await userCollection.updateOne(query, update);
        res.send(result);
    });
};
