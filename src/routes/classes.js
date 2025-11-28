const { ObjectId } = require("mongodb");

// Class-related routes
module.exports = (app, userCollection) => {
    // get all classes
    app.get("/classes", async (req, res) => {
        const count = parseInt(req.query.count);
        const search = req.query.search;
        const query = {
            role: "Instructor",
            classes: { $exists: true, $ne: [] },
        };
        const instructors = await userCollection.find(query).toArray();
        let classes = instructors.flatMap((instructor) => {
            const instructorName = instructor.name;
            const instructorId = instructor._id;
            return instructor?.classes?.map((classItem, classIndex) => ({
                ...classItem,
                instructorName,
                instructorId,
                classIndex,
            }));
        });
        if (search) {
            classes = classes.filter((classItem) =>
                classItem?.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        classes = classes.slice(0, count);
        res.send(classes);
    });

    // get number of classes
    app.get("/classes/total", async (req, res) => {
        const query = { role: "Instructor" };
        const instructors = await userCollection.find(query).toArray();
        const totalClasses = instructors.reduce((total, instructor) => {
            return total + (instructor?.classes?.length || 0);
        }, 0);
        res.send({ totalClasses });
    });

    // get top 10 classes
    app.get("/classes/top", async (req, res) => {
        const query = { role: "Instructor" };
        const instructors = await userCollection.find(query).toArray();
        let allClasses = instructors.flatMap((instructor) => {
            const instructorName = instructor.name;
            const instructorImg = instructor.image;
            const instructorId = instructor._id;
            return instructor?.classes?.map((classItem) => ({
                ...classItem,
                instructorName,
                instructorImg,
                instructorId,
            }));
        });
        const sortedClasses = allClasses.sort(
            (a, b) => b.totalStudent - a.totalStudent
        );
        const topClasses = sortedClasses.slice(0, 10);
        res.send(topClasses);
    });
};
