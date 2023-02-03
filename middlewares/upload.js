const multer = require("multer");
const path = require("path");

const tmpDir = path.join(__dirname, "../tmp");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tmpDir)
    },
    filename: function (req, file, cb) {
        cb(null, Math.floor(Math.random()*10000)+ "_" + file.originalname)
    }
});

const upload = multer({
    storage,
});

module.exports = upload;