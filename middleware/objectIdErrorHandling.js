const ObjectId = require('mongoose').Types.ObjectId;

const isValidObjectId = (req,res,next)=>{
    try{
        if(ObjectId.isValid(req.params.id)){
            next()
        }
        else{
            res.status(302).json({status: false,message:"Invalid objectId"})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server error"})
    }
}

module.exports = isValidObjectId