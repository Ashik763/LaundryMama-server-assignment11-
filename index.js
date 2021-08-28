const express = require("express");
// const bodyParser = require("body-parser");
const cors = require("cors");
// const corsOptions ={ origin:'*', credentials:true} //access-control-allow-credentials:true optionSuccessStatus:200, }
const fs = require("fs-extra");
const fileUpload = require('express-fileupload');
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.moazf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(express.json());
app.use(cors());
// app.use(cors(corsOptions))
app.use(express.static('pictures'));
app.use(fileUpload());

const port = 5000;
app.get("/", (req, res) => {
  res.send("hello world52");
});
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
});
client.connect((err) => {
  // //console.log(err);
  const reviewCollection = client.db("MamaLaundry").collection("reviews");
  const serviceCollection = client.db("MamaLaundry").collection("services");
  const orderCollection = client.db("MamaLaundry").collection("orderCollection");
  const admins = client.db("MamaLaundry").collection("admins");



  app.get("/showReview", (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
      
    });
  });

  app.post("/addReview", (req, res) => {
   
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    //console.log(name,description,file);

    const filePath = `${__dirname}/pictures/${file.name}`;
    file.mv(`${__dirname}/pictures/${file.name}`,err => {
      if(err){
        //console.log(err);
        return res.status(500).send({msg:'failed to upload Image'})
      }
      
      var newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
  
      var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };
  
      reviewCollection.insertOne({name,description,image})
      .then((result) => {
        fs.remove(filePath,error => { 
          if(error){
            
            //console.log(error)
            return res.status(500).send({msg:'failed to upload Image'})
          }
          res.send(result.insertedCount > 0);
         
         })
       
      });

    })

  });

  app.post('/addService',(req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    //console.log(name,description,file,price);

    const filePath = `${__dirname}/pictures/${file.name}`;
    file.mv(`${__dirname}/pictures/${file.name}`,err => {
      if(err){
        //console.log(err);
        return res.status(500).send({msg:'failed to upload Image'})
      }
      
      var newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
  
      var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };
  
      serviceCollection.insertOne({name,description,price,image})
      .then((result) => {
        fs.remove(filePath,error => { 
          if(error){
            
            //console.log(error)
            return res.status(500).send({msg:'failed to upload Image'})
          }
          res.send(result.insertedCount > 0);
         
         })
       
      });

    })



  })
  
  
  
  
  app.get("/showService", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
      // //console.log(documents);
    });
  });




   app.get("/OrderService/:id", (req, res) => {
    const id= req.params.id;
      serviceCollection.find({_id:ObjectId(id)}).toArray((err, documents) => {
      res.send(documents);
      // //console.log(documents);
    });
  });

  

  app.post("/userInfo", (req, res) => {
    const order = req.body;
  
    
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
    // .catch(err => {//console.log(err)})
  });

  app.get("/userInfo/:email", (req, res) => {
    const email = req.params.email;
    //console.log(email);
    orderCollection.find({email:email}).toArray((err, documents) => {
      res.send(documents);
      // //console.log(documents);
    });
  });

  app.get("/checkAdmin/:email", (req, res) => {
    const email = req.params.email;
    // //console.log(email);
    admins.find({email:email}).toArray((err, documents) => {
      res.send(documents.length > 0);
      // //console.log(documents);
    });
  });

  app.get('/allOrders', (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
      // //console.log(documents);
    });



  })

  app.patch("/orderWithState", (req, res) => {
   
    const allOrders = req.body;
    // console.log(state);
    orderCollection.updateOne({_id:ObjectId(allOrders._id)},
  {
    $set:{state:allOrders.state}
  })
  .then(result => {
    // console.log(result.connection);
  })
  })
  app.delete("/deleteOrder/:id", (req, res) => {
   
    id = req.params.id;
    console.log(id);
    orderCollection.deleteOne({_id:ObjectId(id)})

  .then(result => {
    console.log('successfully deleted');
  })



  })

  app.post("/makeAdmin", (req, res) => {
    const admin = req.body;
    console.log(admin);
  
    
    admins.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
    // .catch(err => {//console.log(err)})
  });

  

});

app.listen(process.env.PORT || port);
