const timing = require("../Model/TimingModel")
const router = require("express").Router()
const moment = require("moment")
const isValidObjectId = require("../middleware/objectIdErrorHandling")

router.post("/createTiming", async(req,res)=>{
    try{
        req.body.userId = req.user.userId
        const name = (req.body.session).toLowerCase().trim()
        const sessionName = await timing.find({session: name,isDefault: true,isDeleted: false})
        if(sessionName.length==0){
            const exists = await timing.find({session: name,userId: req.body.userId})
            if(exists.length==0){
                req.body.session = name
                req.body.isDefault = false
                const data = await timing.create(req.body)
                if(data!=null){
                    res.status(200).json({status: true, message: "Timing created successfully", data})
                }
                else{
                    res.status(302).json({status: false, message:"failed to create"})
                }
            }
            else{
                res.status(302).json({status: false, message:"Session name already exists"})
            }     
        }
        else{
            res.status(302).json({status: false, message: "Session Name Already exists"})
        }       
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server error"})
    }
})

router.post("/defaultTiming", async(req,res)=>{
    try{
        const name = (req.body.session).toLowerCase().trim()
        const sessionName = await timing.find({session: name,isDeleted: false})
        if(sessionName.length==0){
            req.body.session = name
            const data = await timing.create(req.body)
            if(data!=null){
                res.status(200).json({status: true, message: "Timing created successfully", data})
            }
            else{
                res.status(302).json({status: false, message:"failed to create"})
            }
        }
        else{
            res.status(302).json({status: false, message: "Session Name Already exists"})
        }       
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server error"})
    }
})

router.get('/getTiming', async(req,res)=>{
    try{
        const data = await timing.find({$and:[{$or:[{isDefault: true}, {userId: req.user.userId}]},{isDeleted: false}]},{createdAt:0,updatedAt:0})
        if(data.length>0){
          const timingList = data.map((i)=>{
              i.session = i.session.charAt(0).toUpperCase() + i.session.slice(1)
              i.timing = moment(i.from_time).format("LT") +" - "+ moment(i.to_time).format("LT")
              return i
            })
            res.status(200).json({status: true, message:"Timing List", data:timingList})
        }
        else{
            res.status(302).json({ status: false, message: "data not found", data})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})

router.get("/getSingleTiming/:id", isValidObjectId,async(req,res)=>{
    try{
        const data = await timing.findOne({_id: req.params.id,isDeleted: false},{createdAt:0,updatedAt:0})
        if(data!=null){
              data.session = data.session.charAt(0).toUpperCase() + data.session.slice(1)
              data.timing = moment(data.from_time).format("LT") +" - "+ moment(data.to_time).format("LT")
              res.status(200).json({status: true, message:"Timing List", data})
        }
        else{
            res.status(302).json({ status: false, message: "data not found", data})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server error"})
    }
})

router.put("/updateTiming/:id", isValidObjectId,async(req,res)=>{
    try{
        const findSession = await timing.findOne({_id: req.params.id,isDefault: false})
        if(findSession!=null){
            const timingList = await timing.find({$and:[{_id: { $ne: req.params.id }},{$or:[{userId: req.user.userId},{isDefault: true}]}]})
            const existsTiming = timingList.filter((i)=>{
                return i.session === (req.body.session).toLowerCase().trim()
            })
            if(existsTiming.length == 0){
                req.body.session = req.body.session ? (req.body.session).toLowerCase().trim() : findSession.session
                const data = await timing.findOneAndUpdate({_id: req.params.id},{$set: req.body}, {new: true})
                if(data!=null){
                    res.status(200).json({status: true, message:"update Successfully", data})
                }
                else{
                    res.status(302).json({ status: false, message: "failed to update", data})
                }
            }
            else{
                res.status(302).json({status: false, message:"Session name already exists"})
            }
        }
        else{
            res.status(302).json({ status: false, message: "data not found", data})
        }        
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})

router.delete("/deleteTime/:id", isValidObjectId,async(req,res)=>{
    try{
        const data = await timing.findOneAndUpdate({_id: req.params.id},{$set: {isDeleted:true}}, {new: true})
        if(data!=null){
            res.status(200).json({status: true, message:"deleted Successfully", data})
        }
        else{
            res.status(302).json({ status: false, message: "failed to delete", data})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})

module.exports = router