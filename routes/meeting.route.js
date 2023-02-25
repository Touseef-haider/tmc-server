const router = require("express").Router();
const scrapedDataCollection = require("../utils/scrapedDataCollection");

router.get("/:date/:meeting", async (req, res) => {
  try {
    let { date, meeting } = req.params;
    const cursor = await scrapedDataCollection.find({
      date: date.replaceAll("-", "/"),
    });
    let doc = await cursor.toArray();
    doc = doc[0];
    const groupByKey = (list, key) =>
      list.reduce(
        (hash, obj) => ({
          ...hash,
          [obj[key]]: (hash[obj[key]] || []).concat(obj),
        }),
        {}
      );
    const meetings = groupByKey(doc.racesData, "meeting");
    // const race = doc.racesData.find(
    //     (race) => race.meeting === meeting && race.ATR === time
    // );
    let reqMeeting;
    for (const mName in meetings) {
      if (mName === meeting) {
        reqMeeting = meetings[mName];
      }
    }
    let races = [];
    meetings[meeting].forEach((race) => {
      races.push({
        time: race.RPOST,
        link: `/race/${date}/${race.index}`,
        index: race.index,
      });
    });
    res.json({ races });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
