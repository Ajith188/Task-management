const jwt = require("jsonwebtoken")
const {user} = require("../Model/userModel")

const userAuthorization = async function(req,res,next){
    try{
       const token = req.headers.authorization
        if(token){
            const userToken = await jwt.verify(token,process.env.secretKey)
            const data = await user.findOne({_id:userToken.userId })
            if(data!=null){
              req.user = userToken
              next()
            }
            else{
              res.status(401).json({status: false,message:"UnAuthorized"})
            }
        } 
        else{
           res.status(401).json({status: false,message:"Invalid Authentication"})
        }
    }
    catch(err){
        res.status(500).json({status:false, message:"Invalid Authentication"})
    }
}

module.exports = userAuthorization