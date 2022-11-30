const router = require('express').Router();
const scrapedDataCollection = require("../utils/scrapedDataCollection");

router.get("/:date", async (req, res) => {
    try {
        let { date } = req.params;
        date.replaceAll("-", "/");
        const cursor = await scrapedDataCollection.find({
            date: date.replaceAll("-", "/"),
        });
        let doc = await cursor.toArray();

        doc = doc[0];
        // doc.racesData.sort((a, b) => a.ATR.localeCompare(b.ATR));
        const groupByKey = (list, key) =>
            list.reduce(
                (hash, obj) => ({
                    ...hash,
                    [obj[key]]: (hash[obj[key]] || []).concat(obj),
                }),
                {}
            );
        const meetings = groupByKey(doc.racesData, "meeting");
        const meetingNames = Object.getOwnPropertyNames(meetings);
        let meetingRaces = [];
        for (const meeting in meetings) {
            let races = [];
            meetings[meeting].forEach((race) => {
                races.push({
                    time: race.RPOST,
                    link: `/race/${date}/${race.index}`,
                    index: race.index,
                });
            });
            meetingRaces.push(races);
        }
        res.json({ meetingNames, meetingRaces });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;