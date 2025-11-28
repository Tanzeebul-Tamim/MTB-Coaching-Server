export async function instructorRanking(userCollection, slice, search) {
    const pipeline = [
        { $match: { role: "Instructor" } },

        // compute totalStudents
        {
            $addFields: {
                totalStudents: {
                    $sum: "$classes.totalStudent",
                },
            },
        },

        // sort by totalStudents descending
        { $sort: { totalStudents: -1 } },

        // assign ranking using window function
        {
            $setWindowFields: {
                sortBy: { totalStudents: -1 },
                output: {
                    ranking: { $rank: {} },
                },
            },
        },
    ];

    // optional search
    if (search) {
        pipeline.push({
            $match: { name: { $regex: search, $options: "i" } },
        });
    }

    // optional slice (top 10)
    if (slice) {
        pipeline.push({ $limit: 10 });
    }

    return await userCollection.aggregate(pipeline).toArray();
}
