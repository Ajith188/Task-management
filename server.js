const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv").config()
const user = require("./Controller/userController")
const authorization = require("./middleware/auth")
const task = require("./Controller/taskController")
const category = require('./Controller/categoryController')
const subCategory = require("./Controller/subCategoryController")
const timing = require("./Controller/timingController")

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.use('/uploads', express.static('./Files'));
app.use('/user', user)
app.use('/default', category, timing)
app.use('/task', authorization, task, category, subCategory, timing)


mongoose.connect(process.env.DB_url).then((res)=>{
    console.log("DB connected")
}).catch((err)=>{
    console.log("err", err)
    console.log("DB not connected")
})

app.get('/',(req,res)=>{
    res.status(200).json("Welcome Day-Planner")
})

app.listen(process.env.PORT,()=>{
   console.log("Port is running on "+ process.env.PORT)
})