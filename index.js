const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require('express-fileupload');
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.moazf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('pictures'));
app.use(fileUpload());

const port = 5000;
app.get("/", (req, res) => {
  res.send("hello world2");
});
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  // console.log(err);
  const reviewCollection = client.db("MamaLaundry").collection("reviews");

  app.get("/showReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
      // console.log(documents);
    });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    // console.log(review);
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  const serviceCollection = client.db("MamaLaundry").collection("services");
  app.post("/addService", (req, res) => {
    const service = req.body;
    console.log(service);
    serviceCollection.insertOne(service).then((result) => {
      res.send(result.insertedCount > 0);
    });
    // .catch(err => {console.log(err)})
  });
  app.get("/showService", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
      // console.log(documents);
    });
  });

    app.post("/OrderService/:id", (req, res) => {
    const OrderService = req.body;
    
    serviceCollection.insertOne(OrderService).then((result) => {
      res.send(result.insertedCount > 0);
    });
    // .catch(err => {console.log(err)})
  });


  app.get("/OrderService/:id", (req, res) => {
    const id= req.params.id;
      serviceCollection.find({_id:ObjectId(id)}).toArray((err, documents) => {
      res.send(documents);
      // console.log(documents);
    });
  });

  

  const orderCollection = client.db("MamaLaundry").collection("orderCollection");
  app.post("/userInfo/:phone", (req, res) => {
    const order = req.body;
    // console.log(order);
    
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
    // .catch(err => {console.log(err)})
  });

  app.get("/userInfo/:phone", (req, res) => {
    const phone = req.params.phone;
    orderCollection.find({phone:phone}).toArray((err, documents) => {
      res.send(documents);
      // console.log(documents);
    });
  });



  

});

app.listen(process.env.PORT || port);
