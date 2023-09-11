const router = require("express").Router()
const { category } = require("../Model/categoryModel")
const { subCategory } = require("../Model/subCategoryModel")
const isValidObjectId = require("../middleware/objectIdErrorHandling")

router.post("/createSubCategory", async (req, res) => {
    try {
        req.body.userId = req.user.userId
        const categoryList = await category.find({$and:[{$or:[{isDefault: true}, {userId: req.user.userId}]},{_id: req.body.categoryId},{isDeleted: false}]})
        if(categoryList.length>0){
            const name = (req.body.subCategoryName).toLowerCase().trim()
            const subCategoryName = await subCategory.find({$and:[{ subCategoryName: name },{categoryId: req.body.categoryId},{userId: req.user.userId},{isDeleted: false}]})
            if (subCategoryName.length == 0) {
                req.body.subCategoryName = name
                const data = await subCategory.create(req.body)
                if (data != null) {
                    res.status(200).json({ status: true, message: "SubCategory created successfully", data })
                }
                else {
                    res.status(302).json({ status: false, message: "Failed to create" })
                }
            }
            else {
                res.status(302).json({ status: false, message: "SubCategory name Already exists" })
            }
        }
        else{
            res.status(302).json({status: false, message:"category not found"})
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: "Internal server error" })
    }
})

router.get("/getAllSubCategory", async(req,res)=>{
    try{
       const data = await subCategory.find({userId: req.user.userId,isDeleted: false},{createdAt:0,updatedAt:0})
       if(data.length>0){
          res.status(200).json({status: true, message:"subcategory list", data})
       }
       else{
        res.status(302).json({status: false,message:"data not found"})
       }
    }
    catch(err){
        res.status(500).json({status: false, message: "Internal server error"})
    }
})

router.get("/getSubCategoryByCategory/:id",isValidObjectId,async (req, res) => {
    try {
        const data = await subCategory.find({ categoryId: req.params.id, userId: req.user.userId,isDeleted: false },{createdAt:0,updatedAt:0})
        if (data.length > 0) {
            const subCategoryList = data.map((i) => {
                i.subCategoryName = i.subCategoryName.charAt(0).toUpperCase() + i.subCategoryName.slice(1)
                return i
            })
            res.status(200).json({ status: true, message: "SubCategory list", data: subCategoryList })
        }
        else {
            res.status(302).json({ status: false, message: "data not found" })
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: "Internal server error" })
    }
})

router.get("/getSingleSubCategory/:id", isValidObjectId,async (req, res) => {
    try {
        const data = await subCategory.findOne({ _id: req.params.id, userId: req.user.userId,isDeleted: false },{createdAt:0,updatedAt:0})
        if (data != null) {
            data.subCategoryName = data.subCategoryName.charAt(0).toUpperCase() + data.subCategoryName.slice(1)
            res.status(200).json({ status: true, message: "subCategory List", data })
        }
        else {
            res.status(302).json({ status: false, message: "data not found" })
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: "Internal server error" })
    }
})

router.put("/updateSubCategory/:id", isValidObjectId,async (req, res) => {
    try {
        const findSubCategory = await subCategory.findOne({ _id: req.params.id, userId: req.user.userId,isDeleted: false })
        if (findSubCategory != null) {
            const subCategoryList =  await subCategory.find({ _id: { $ne: req.params.id },userId: req.user.userId})
            const existsSubCategory = subCategoryList.filter((i)=>{
                return i.subCategoryName === (req.body.subCategoryName).toLowerCase().trim()
            })
            if(existsSubCategory.length==0){
                req.body.subCategoryName = req.body.subCategoryName ? (req.body.subCategoryName).toLowerCase().trim() : findSubCategory.subCategoryName
                const data = await subCategory.findOneAndUpdate({_id: req.params.id},{$set: req.body}, {new: true})
                if(data!=null){
                    res.status(200).json({status: true, message:"Update successfully", data})
                }
                else{
                    res.status(302).json({ status: false, message: "Failed to update", data})
                }
            }
            else{
                res.status(302).json({status: false, message:"Subcategory name already exists"})
            }   
        }
        else {
            res.status(302).json({ status: false, message: "data not found" })
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: "Internal server error" })
    }
})

router.delete("/deleteSubCategory/:id", isValidObjectId,async (req, res) => {
    try {
        const data = await subCategory.findOneAndUpdate({ _id: req.params.id,userId: req.user.userId }, { $set: { isDeleted: true } }, { new: true })
        if (data != null) {
            res.status(200).json({ status: true, message: "Deleted successfully", data })
        }
        else {
            res.status(302).json({ status: false, message: "failed to delete" })
        }
    }
    catch (err) {
        res.status(500).json({ status: false, message: "Internal server error" })
    }
})

module.exports = router