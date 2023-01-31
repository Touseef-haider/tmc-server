const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

const allRacesData = require("./routes/allRacesData.route.js")
const allMeetings = require("./routes/allMeetings.route.js")
const meeting = require("./routes/meeting.route.js")
const race = require("./routes/race.route.js")
// const trackMyTheoryResults = require("./routes/trackMyTheory/results.route.js")

app.use(express.json());
//app.use(cors());
app.use(cors({
    origin: '*'
}));

app.use('/api/all-races-data', allRacesData)
app.use('/api/meeting', allMeetings)
app.use('/api/meeting', meeting)
app.use('/api/race', race)
// app.use('/api/trackmytheory', trackMyTheoryResults)



app.get("/api", (req, res) => {
    res.send("Hello World!");
});








app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
