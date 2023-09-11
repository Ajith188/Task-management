const mongoose = require("mongoose")

const timingSchema = new mongoose.Schema({
    session:{
        type: String
    },
    from_time:{
        type: Date
    },
    to_time:{
        type: Date
    },
    timing:{
        type: String
    },
    userId:{
        type: mongoose.Types.ObjectId
    },
    isDefault:{
        type: Boolean
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
    versionKey: false
})

const timing = mongoose.model("task_timing", timingSchema)

module.exports = timing