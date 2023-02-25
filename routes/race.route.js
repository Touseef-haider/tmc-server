const router = require("express").Router();
const scrapedDataCollection = require("../utils/scrapedDataCollection");
const { liveScore } = require("../utils/liveScore");

router.post("/liveScore", async (req, res, next) => {
  try {
    const { link } = req.body;
    console.log(link);
    const data = await liveScore(link);
    console.log("___________________", data);
    const cursor = await scrapedDataCollection.find({});
    let doc = await cursor.toArray();
    doc = doc[0];
    const race = (doc?.racesData).find((s) => s?.SLIFELink === link);
    race = {
      ...race,
      liveScore: data,
    };
    const index = (doc?.racesData).findIndex((s) => s?.SLIFELink === link);
    if (index >= 0) {
      doc.racesData[index] = race;
    }
    await scrapedDataCollection.replaceOne({ _id: doc._id }, doc);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/:date/:index", async (req, res) => {
  try {
    let { date, index } = req.params;
    date = date.replaceAll("-", "/");
    const cursor = await scrapedDataCollection.find({ date });
    let doc = await cursor.toArray();
    doc = doc[0];
    // doc.racesData.sort((a, b) => a.ATR.localeCompare(b.ATR));
    // const race = doc.racesData[index - 1];
    const race = doc.racesData.find((race) => race.index == index);
    const columnIndexer = (col) => {
      if (col)
        return col.map((atrCell, index) => {
          let horseNo =
            race.horses.findIndex(
              (horse) => horse.toLowerCase() === atrCell.toLowerCase()
            ) + 1;
          if (horseNo === 0) {
            horseNo =
              race.horses.findIndex(
                (horse) =>
                  horse.toLowerCase() ===
                  atrCell.slice(atrCell.indexOf(" ") + 1).toLowerCase()
              ) + 1;
          }
          return {
            index: index + 1,
            horseName: horseNo + " " + atrCell,
          };
        });
      else return "";
    };
    const ATR1 = columnIndexer(race.ATR1);
    race.ATR1 = ATR1;

    const sortAsATR1 = (col) => {
      let sortedArr = [];
      for (let index = 0; index < ATR1.length; index++) {
        const horse = col.find(
          (hor) =>
            hor.horseName
              .slice(hor.horseName.search("[a-zA-Z]"))
              .toUpperCase() ===
            ATR1[index].horseName
              .slice(ATR1[index].horseName.search("[a-zA-Z]"))
              .toUpperCase()
        );
        sortedArr.push(horse);
      }
      return sortedArr;
    };

    race.ATR2 = Array.isArray(race.ATR2) ? columnIndexer(race.ATR2) : race.ATR2;

    if (race.ATR2 && Array.isArray(race.ATR2)) {
      race.ATR2 = sortAsATR1(race.ATR2);
    }
    race.ATR3 = Array.isArray(race.ATR3) ? columnIndexer(race.ATR3) : race.ATR3;
    if (race.ATR3 && Array.isArray(race.ATR3)) {
      race.ATR3 = sortAsATR1(race.ATR3);
    }
    race.RPOST1 = Array.isArray(race.RPOST1)
      ? columnIndexer(race.RPOST1)
      : race.RPOST1;
    if (race.RPOST1 && Array.isArray(race.RPOST1)) {
      race.RPOST1 = sortAsATR1(race.RPOST1);
    }

    race.RPOST2 = Array.isArray(race.RPOST2)
      ? columnIndexer(race.RPOST2)
      : race.RPOST2;
    if (race.RPOST2 && Array.isArray(race.RPOST2)) {
      race.RPOST2 = sortAsATR1(race.RPOST2);
    }

    const catAdder = (selHorses, catName) => {
      if (selHorses) {
        if (selHorses.length != 0) {
          const objArr = [];
          selHorses.forEach((horse) => {
            objArr.push({ name: horse, cat: catName });
          });
          return objArr;
        }
      } else return [];
    };
    race.atrSelectedHorses = catAdder(race.atrSelectedHorses, "atrSelected");
    race.timeformSelectedHorses = catAdder(
      race.timeformSelectedHorses,
      "timeformFromAtr"
    );
    race.sLifeSelectedHorses = catAdder(
      race.sLifeSelectedHorses,
      "timeformFromSLife"
    );

    res.json({ status: "ok", race });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

module.exports = router;
