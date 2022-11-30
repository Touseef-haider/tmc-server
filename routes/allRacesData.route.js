const scrapedDataCollection = require("../utils/scrapedDataCollection");

const router = require("express").Router();

router.get("/", async (req, res) => {
    try {
        const cursor = await scrapedDataCollection
            .find()
            .limit(1)
            .sort({ $natural: -1 });
        let doc = await cursor.toArray();
        doc = doc[0];
        doc.racesData.sort((a, b) => a.ATR.localeCompare(b.ATR));
        res.json(doc);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
