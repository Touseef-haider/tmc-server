const router = require("express").Router();
const trackMyTheoryCollection = require("../../utils/trackMyTheoryCollection.js");

router.get("/result/:date/:index", async (req, res) => {
    try {
        let { date, index } = req.params;
        date = date.replaceAll("-", "/");
        const raceId = `${date}#${index}`

        console.log(raceId)

        const cursor = await trackMyTheoryCollection.find();
        let doc = await cursor.toArray();
        const results = doc[0].results

        const result = results[raceId]
        
        console.log("Required Result: ", result || "Not Found")

        res.status(200).json({
            status: result ? 1 : 0,
            result
        });
    } catch (error) {
        res.json({ status: "error", message: error.message });
        console.log(error);
    }
});

module.exports = router;