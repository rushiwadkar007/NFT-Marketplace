const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const nftRoute = require('./routes/NFT');
const authRoute = require('./routes/auth');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
//'mongodb://localhost:27017/matellio'
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', err => {
  console.log('Connection failed.');
});

mongoose.connection.on('connected', connected => {
  console.log('Connection successful.');
});

// const uri = "mongodb+srv://nilesh_panhale:User@123@cluster0.2scel.mongodb.net/nftUser?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { 
//         useNewUrlParser: true, 
//         useUnifiedTopology: true, 
//         serverApi: ServerApiVersion.v1 
// });
// client.connect(err => {
//   const collection = client.db("nftUser").collection("users");
//   client.close();
// });
// .then((result) => {console.log("Connected to DB");})
// .catch((err) => console.log(err));

app.use("/nfts", nftRoute);
app.use("/user", authRoute);
app.use('/public', express.static('./public'));
app.listen(5050, () => { console.log("backend server is running on 5050..."); })