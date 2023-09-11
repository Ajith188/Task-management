const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isDeleted:{
    type: Boolean,
    default: false
  },
  lastLoggedIn:{
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
})

const otpSchema = new mongoose.Schema({
   otp: {
     type: Number
   },
   userId:{
    type: String
   }
},
{
  timestamps: true,
  versionKey: false
})

const mailStatusSchema = new mongoose.Schema({
  name:{
    type: String
  },
  email:{
    type: String
  },
  status:{
    type: String
  }
},
{
timestamps: true,
versionKey: false
})

const user = mongoose.model("user", userSchema)
const otp = mongoose.model("otp", otpSchema)
const mailStatus = mongoose.model("mailStatus", mailStatusSchema)

module.exports = {
  user,
  otp,
  mailStatus
}