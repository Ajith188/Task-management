const {body} = require("express-validator")

const validation = [
    body('email').isEmail().withMessage("Enter valid emailId"),
    body('phoneNumber').isMobilePhone().withMessage("Enter valid phonenumber")
]

module.exports = validation
