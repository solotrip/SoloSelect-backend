import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import photoRoutes from "./routes/photos.js";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/photos", photoRoutes);

//Local Mongo
const CONECTION_URL = "mongodb://localhost:27017/solotrip";

//Mongodb Atlas
/*const CONECTION_URL =
  "mongodb+srv://solotrip:test@yerlifaruk.sdcam.mongodb.net/solotrip?retryWrites=true&w=majority";

  */

const PORT = process.env.PORT || 5001;

mongoose
  .connect(CONECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => {
    console.log(error.message);
  });

mongoose.set("useFindAndModify", false);
