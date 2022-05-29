const multer = require('multer');
const path = require('path');
const DIR = path.join(__dirname, "../public/excelsheets");
const imagesDIR = path.join(__dirname, "../public/nfts");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'filename') {
            cb(null, DIR);
        }
        else {
            cb(null, imagesDIR);
        }
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

module.exports = { upload };