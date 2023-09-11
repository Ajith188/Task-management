const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const {user, otp} = require('../Model/userModel')
const sendMail = require("../utils/sendEmail")
const { validationResult } = require('express-validator');
const validation = require('../middleware/validation')

router.post("/signup", validation,async(req,res)=>{
   try{
      const validationError = validationResult(req);
      if (validationError.isEmpty()) {
        const userData = await user.find({$or:[{email:req.body.email},{phoneNumber:req.body.phoneNumber}]})
        if(userData.length==0){
             const data = await user.create(req.body)
             if(data!=null){
                 var otpNumber = Math.floor(100000 + Math.random() * 900000);
                 const otpString = otpNumber.toString()
                 const saveOtp = await otp.create({otp:otpNumber,userId:data._id})
                 const emailSend = await sendMail(data.email, "Day Planner - OTP", `Your OTP is ${otpString}`)
                 res.status(200).json({status: true, message: "Register successfully,otp send to your email", data})
                 setTimeout(async()=>{
                  await otp.findOneAndDelete({_id:saveOtp._id})
               },180000)
             }
             else{
                res.status(302).json({status: false,message:"Failed to create"})
             }
        }
        else{
           res.status(302).json({status: false, message:"Email or phonenumber already exists"})
        }
      }
      else{
          res.status(302).json({status: false, message:"Validation Error",error: validationError.errors})
      }
   }
   catch(err){
      res.status(500).json({status: false, message:"Internal Server Error"})
   }
})

router.post('/verifyOTP', async(req,res)=>{
   try{
      const data = await otp.findOne({otp: req.body.otp, userId: req.body.userId})
      if(data!=null){
         const userData = await user.findOne({_id: req.body.userId})
         const token = await jwt.sign({ userId: userData._id,name: userData.name, email: userData.email }, process.env.secretKey)
         const updateUser = await user.findOneAndUpdate({_id:userData._id},{$set:{isActive:true,lastLoggedIn : new Date()}},{new: true})
         res.status(200).json({ status: true, message: "OTP verified successfully!", updateUser, token })
      }
      else{
         res.status(302).json({status: false, message: "Invalid otp"})
      }
   }
   catch(err){
      res.status(500).json({status: false, message:"Internal Server error"})
   }
})

router.post('/resendOTP', async(req,res)=>{
   try{
      const findUser = await user.findOne({phoneNumber: req.body.phoneNumber})
      if(findUser!=null){
        req.body.lastLoggedIn = new Date()
        var otpNumber = Math.floor(100000 + Math.random() * 900000);
        const otpString = otpNumber.toString()
        const saveOtp = await otp.create({otp:otpNumber,userId:findUser._id})
        const emailSend = await sendMail(findUser.email, "Day Planner - OTP", `Your OTP is ${otpString}`)
        res.status(200).json({status: true,message:"OTP sent to your Email",data:findUser})
        setTimeout(async()=>{
         await otp.findOneAndDelete({_id:saveOtp._id})
        },180000)
      }
      else{
         res.status(302).json({status: false, message:"Please signup!"})
      }
   }
   catch(err){
      res.status(500).json({status: false, message:"Internal Server error"})
   }
})

router.post("/login", async(req,res)=>{
   try{
       const findUser = await user.findOne({phoneNumber: req.body.phoneNumber,isDeleted: false})
       if(findUser!=null){
         var otpNumber = Math.floor(100000 + Math.random() * 900000);
         const otpString = otpNumber.toString()
         const saveOtp = await otp.create({otp:otpNumber,userId:findUser._id})
         const emailSend = await sendMail(findUser.email, "Day Planner - OTP", `Your OTP is ${otpString}`)
         res.status(200).json({status: true,message:"Login Successfully, OTP sent to your Email",data: findUser})
         setTimeout(async()=>{
            await otp.findOneAndDelete({_id:saveOtp._id})
         },180000)
       }
       else{
          res.status(302).json({status: false, message:"Please signup!"})
       }
   }
   catch(err){
      res.status(500).json({status: false, message:"Internal Server error"})
   }
})

module.exports = router
