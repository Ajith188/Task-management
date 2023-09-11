const router = require("express").Router()
const {category}  = require("../Model/categoryModel")
const isValidObjectId = require("../middleware/objectIdErrorHandling")

router.post("/createCategory", async(req,res)=>{
    try{
        req.body.userId = req.user.userId
        const name = (req.body.categoryName).toLowerCase().trim()
        const categoryName = await category.find({categoryName: name,isDefault: true,isDeleted: false})
        if(categoryName.length==0){
            const exists = await category.find({categoryName: name,userId: req.body.userId})
            if(exists.length==0){
                req.body.categoryName = name
                req.body.isDefault = false
                const data = await category.create(req.body)
                if(data!=null){
                    res.status(200).json({status: true, message: "category created successfully", data})
                }
                else{
                    res.status(302).json({status: false, message:"failed to create"})
                }
            }
            else{
                res.status(302).json({status: false,message: "categoryName Already exists"})
            }
        }
        else{
            res.status(302).json({status: false, message: "Category Name Already exists"})
        }       
    }
    catch(err){
        res.status(500).json({status: false,message:"Internal Server error"})
    }
})

router.post("/defaultCategory", async(req,res)=>{
    try{
        const name = (req.body.categoryName).toLowerCase().trim()
        const categoryName = await category.find({categoryName: name,isDeleted: false})
        if(categoryName.length==0){
            req.body.categoryName = name
            const data = await category.create(req.body)
            if(data!=null){
                res.status(200).json({status: true, message: "category created successfully", data})
            }
            else{
                res.status(302).json({status: false, message:"failed to create"})
            }
        }
        else{
            res.status(302).json({status: false, message: "Category Name Already exists"})
        }       
    }
    catch(err){
        res.status(500).json({status: false,message:"Internal Server error"})
    }
})

router.get('/getCategory', async(req,res)=>{
    try{
        const data = await category.find({$and:[{$or:[{isDefault: true}, {userId: req.user.userId}]},{isDeleted: false}]},{createdAt:0,updatedAt:0})
        if(data.length>0){
            const categoryList = data.map((i)=>{
              i.categoryName = i.categoryName.charAt(0).toUpperCase() + i.categoryName.slice(1)
              return i
            })
            res.status(200).json({status: true, message:"category List", data:categoryList})
        }
        else{
            res.status(302).json({ status: false, message: "data not found", data})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})

router.get("/getSingleCategory/:id",isValidObjectId, async(req,res)=>{
    try{
        const data = await category.findOne({_id: req.params.id, isDeleted: false},{createdAt:0,updatedAt:0})
        if(data!=null){
            data.categoryName = data.categoryName.charAt(0).toUpperCase() + data.categoryName.slice(1)
            res.status(200).json({status: true, message:"category List", data})
        }
        else{
            res.status(302).json({ status: false, message: "data not found"})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})

router.put("/updateCategory/:id", isValidObjectId,async(req,res)=>{
    try{
        const findCategory = await category.findOne({_id: req.params.id,isDeleted: false})
        if(findCategory!=null){
            const categoryList = await category.find({$and:[{_id: { $ne: req.params.id }},{$or:[{userId: req.user.userId},{isDefault: true}]}]})
            const existsCategory = categoryList.filter((i)=>{
                return i.categoryName === (req.body.categoryName).toLowerCase().trim()
            })
            if(existsCategory.length==0){
                req.body.categoryName = req.body.categoryName ? (req.body.categoryName).toLowerCase().trim() : findCategory.categoryName
                const data = await category.findOneAndUpdate({_id: req.params.id},{$set: req.body}, {new: true})
                if(data!=null){
                    res.status(200).json({status: true, message:"Update successfully", data})
                }
                else{
                    res.status(302).json({ status: false, message: "Failed to update", data})
                }
            }
            else{
                res.status(302).json({status: false, message:"Category name already exists"})
            }   
        }
        else{
            res.status(302).json({ status: false, message: "data not found"})
        }        
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})

router.delete("/deleteCategory/:id",isValidObjectId, async(req,res)=>{
    try{
        const data = await category.findOneAndUpdate({_id: req.params.id,isDeleted: false},{$set: {isDeleted:true}},{new: true})
        if(data!=null){
            res.status(200).json({status: true, message:"deleted Successfully", data})
        }
        else{
            res.status(302).json({ status: false, message: "failed to delete"})
        }
    }
    catch(err){
        res.status(500).json({status: false, message:"Internal Server Error"})
    }
})


module.exports = router