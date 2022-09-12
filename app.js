import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import cors from 'cors'
import {v4 as uuidv4} from 'uuid'
import dayjs from 'dayjs'

dotenv.config();

const app = express();
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
app.use(express.json());
app.use(cors());

mongoClient.connect().then(() => {
   db = mongoClient.db("MyWallet");
});

app.post('/register', async (req,res) =>{
   const {name, email, password} = req.body
   try {
      await db.collection('users').insertOne(req.body)
      res.sendStatus(201)
   } catch (error) {
      console.log(error.message)
      res.sendStatus(500)
   }
})

app.post('/', async (req,res) =>{
   const {email, password} = req.body
   const user = await db.collection('users').findOne(req.body)
   if(user){
      const token = uuidv4()
      await db.collection('sessions').insertOne({
         userId: user._id,
         token
      })
      res.send({
         token,
         name:user.name
      })
   }else{
      res.sendStatus(403)
   }
})

app.post('/income', async (req,res) => {
   const {amount , description} = req.body
   
   try {
      await db.collection('transactions').insertOne({
         amount,
         description,
         type:'income',
         date:dayjs().format('DD/MM')
      })
      res.sendStatus(201)
   } catch (error) {
      console.log(error.message)
      res.sendStatus(500)
   }
})
app.post('/expense', async (req,res) => {
   const {amount , description} = req.body
   try {
      await db.collection('transactions').insertOne({
         amount,
         description,
         type:'expense',
         date:dayjs().format("DD/MM")
      })
      res.sendStatus(201)
   } catch (error) {
      console.log(error.message)
      res.sendStatus(500)
   }
})

app.get('/home', async (req,res) =>{
   try {
      const transactions = await db.collection('transactions').find().toArray()
      res.send(transactions)
   } catch (error) {
      console.log(error.message)
      res.sendStatus(500)
   }
})

app.listen(5000, () => console.log("Listening on port 5000"));
