const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express()
const port = process.env.PORT ||8000;

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})
console.log(process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j2qvb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

client.connect(err => {
  const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  if(err){
      console.log("error: " +err);
  }
  // perform actions on the collection object

  //get data 
  app.get('/products', (req, res) => {

    productCollection.find()
    .toArray((err, items)=>{
      res.send(items);
      //console.log("datas are: ", items);
    })
  })

  //add data
  app.post('/addProduct',(req,res) => {
    const newProduct = req.body;
    console.log(newProduct);

    productCollection.insertOne(newProduct)
    .then(result =>{
      console.log("inserted count ",result.insertedCount);
      res.send(result.insertedCount>0);
    })

  })

  ///add order: place order by
  app.post('/placeOrder',(req, res) =>{
    const newOrder = req.body;
    console.log(newOrder);

    orderCollection.insertOne(newOrder)
    .then(result =>{
      console.log("inserted count ",result.insertedCount);
      res.send(result.insertedCount>0);
    })
  })

  ///get order list
  app.get('/orderList',(req, res)=>{
    orderCollection.find({email: req.query.email})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })

  //delete one product
  app.delete('/deleteProduct/:id',(req,res) => {

    const id = ObjectID(req.params.id);
    console.log("delete this",id);
    productCollection.findOneAndDelete({_id: id})
    .then(result => {
      console.log(result);
      res.send(result)})
  })

  // load single product 
  app.get('/singleProduct/:id',(req, res) =>{
    productCollection.find({_id: ObjectID(req.params.id)})
    .toArray((err,documents) =>{
      res.send(documents[0]);
    })
  })
  console.log("connected db success")
  //client.close();
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})