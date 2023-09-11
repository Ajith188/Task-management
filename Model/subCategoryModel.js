const mongoose = require("mongoose")

const subCategorySchema = new mongoose.Schema({
    categoryId:{
        type: mongoose.Types.ObjectId
    },
    subCategoryName:{
        type: String
    },
    userId:{
        type: mongoose.Types.ObjectId
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false
})

const subCategory = mongoose.model("subCategory", subCategorySchema)

module.exports = {
    subCategory
}