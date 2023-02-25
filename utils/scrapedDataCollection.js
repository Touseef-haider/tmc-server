const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
// const uri = "mongodb://Nawaz:horsesData123%23%40%21Nawaz@localhost:27017";
const client = new MongoClient(uri);

const database = client.db("horse-races");
const scrapedDataCollection = database.collection("scrapedData");

module.exports = scrapedDataCollection;
