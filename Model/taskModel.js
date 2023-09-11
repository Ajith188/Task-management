const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
     userId:{ 
        type: mongoose.Types.ObjectId
     },
     userEmail:{ 
      type: String
     },
     title :{
        type: String
     },
     description:{
       type: String
     },
     images:{
       type: Array
     },
     category:{
       type: mongoose.Types.ObjectId
     },
     subCategory:{
       type: mongoose.Types.ObjectId
     },
     assignedDate:{
        type: Date
     },
     month:{
       type: String
     },
     timing:{
        type: mongoose.Types.ObjectId
     },
     frequency:{
      type: String,
      enum:["Does not repeat", "Every day", "Every week", "Every month", "Every year"]
    },
    exact_time:{
       type: Boolean,
       default: false
    },
     timeLine:{
        type: Array,
        default:[]
     },
     status:{
        type: Boolean,
        default : true
     },
     isActive:{
       type: Boolean,
       default: true
     },
     isDeleted:{
       type: Boolean,
       default: false
     }
},{
   timestamps: true,
   versionKey: false
})

const task = mongoose.model("taskMaster", taskSchema)

module.exports = task