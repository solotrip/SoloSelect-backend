import express from "express";

import { default as mongodb } from "mongodb";

let MongoClient = mongodb.MongoClient;

const uri1 = "mongodb://localhost:27017/";
const uri =
  "mongodb+srv://yerlifaruk:123123a@yerlifaruk.sdcam.mongodb.net/solotrip?retryWrites=true&w=majority";

const uri2 =
  "mongodb+srv://solotrip:test@yerlifaruk.mongodb.net/solotrip?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const router = express.Router();

let photos = [
  {
    id: "3VCrw7nHH4A",
    name: "San Salvador City Card",
    key: "san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    value:
      "https://soloselect.s3.eu-central-1.amazonaws.com/san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    type: "city-card",
    wkd_id: "Q44217",
    width: 5492,
    height: 3043,
  },
  {
    id: "3VCrw7nHH4A",
    name: "Eskisehir City Card",
    key: "eskisehir-turkey_Q1_city-card_3VCrw7nHH4A",
    value:
      "https://soloselect.s3.eu-central-1.amazonaws.com/san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    type: "city-card",
    wkd_id: "Q1",
    width: 5492,
    height: 3043,
  },
  {
    id: "3VCrw7nHH4A",
    name: "Istanbul City Card",
    key: "eskisehir-turkey_Q1_city-card_3VCrw7nHH4A",
    value:
      "https://soloselect.s3.eu-central-1.amazonaws.com/san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    type: "city-card",
    wkd_id: "Q2",
    width: 5492,
    height: 3043,
  },
  {
    id: "3VCrw7nHH4A",
    name: "Istanbul City Card",
    key: "eskisehir-turkey_Q1_city-card_3VCrw7nHH4A",
    value:
      "https://soloselect.s3.eu-central-1.amazonaws.com/san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    type: "city-card",
    wkd_id: "Q2",
    width: 5492,
    height: 3043,
  },
  {
    id: "3VCrw7nHH4A",
    name: "Istanbul City Card",
    key: "eskisehir-turkey_Q1_city-card_3VCrw7nHH4A",
    value:
      "https://soloselect.s3.eu-central-1.amazonaws.com/san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    type: "city-card",
    wkd_id: "Q2",
    width: 5492,
    height: 3043,
  },
  {
    id: "3VCrw7nHH4A",
    name: "Eskisehir City Card",
    key: "eskisehir-turkey_Q1_city-card_3VCrw7nHH4A",
    value:
      "https://soloselect.s3.eu-central-1.amazonaws.com/san-salvador-de-jujuy-argentina_Q44217_city-card_3VCrw7nHH4A",
    type: "city-card",
    wkd_id: "Q1",
    width: 5492,
    height: 3043,
  },
];

async function run(incomingPhoto) {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    //await client.db("solotrip").collection("photos").insertOne(incomingPhoto);

    console.log("Connected successfully to server");

    const db = client.db("solotrip");
    const col = db.collection("photos");
    const p = await col.insertOne(incomingPhoto);
    const myDoc = await col.findOne();
    console.log(myDoc);
  } catch (err) {
    console.log(err.stack);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function getAllPhotos() {
  try {
    let cursorElements = [];
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    //await client.db("solotrip").collection("photos").insertOne(incomingPhoto);

    console.log("Connected successfully to server");

    const db = client.db("solotrip");
    const col = db.collection("photos");

    const cursor = col.find();

    const allValues = await cursor.toArray();

    console.log("all Values are :", allValues);

    /*
    await cursor.forEach((doc) => {
      console.log(doc);
      cursorElements.push(doc);
    });
    */

    photos = allValues;

    return allValues;
  } catch (err) {
    console.log(err.stack);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

router.get("/", (req, res) => {
  const photosCome = getAllPhotos().then((x) => {
    console.log("photos coming to api point: ", x);
    //photos.push(photosCome);
    res.json(photos);
  });
});

router.get("/:id", (req, res) => {
  const photoId = req.params.id;
  const getPhoto = photos.find((photo) => photo.id === photoId);
  if (!getPhoto) {
    res.status(500).send("Photo not found.");
  } else {
    res.json(getPhoto);
  }
});

router.post("/", (req, res) => {
  const incomingPhoto = req.body;

  photos.push(incomingPhoto);

  //Add incoming Photo to photos collection in mongo.
  //MongoClient.connect();

  run(incomingPhoto).catch(console.dir);
  res.json(photos);
});

router.delete("/photos/:id", (req, res) => {
  const photoId = req.params.id;
  const newPhotos = photos.filter((photo) => photo.id != photoId);

  if (!newPhotos) {
    res.status(500).send("Photo not found.");
  } else {
    photos = newPhotos;
    res.send(photos);
  }
});

export default router;
