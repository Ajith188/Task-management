const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String
    },
    color:{
        type: String
    },
    userId:{
        type: mongoose.Types.ObjectId,
    },
    isDefault:{
        type: Boolean
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    versionKey: false
})

const category = mongoose.model("category", categorySchema)

module.exports={
    category
}