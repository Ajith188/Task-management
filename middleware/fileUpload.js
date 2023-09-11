const multer = require('multer')
const fs = require("fs");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var file='./Files'
        if(!fs.existsSync(file)){
            fs.mkdirSync(file, {
                recursive: true
            })
        }
        cb(null, './Files');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString()+'-'+ file.originalname);
    }
});

const fileFilters=(req,file,cb)=>{ 
    if(file.mimetype=="text/csv"){
        cb(null,true)
    }else{
        cb(null,false)
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilters
})


module.exports = {
    upload
}