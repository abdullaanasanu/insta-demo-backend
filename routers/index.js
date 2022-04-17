const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const router = express.Router();

// router('/')
router.use('/auth', require('./auth'))
router.use('/profile', require('./profile'))
router.use('/post', require('./post'))

router.use(fileUpload());

router.post('/upload', (req, res) => {
    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.image;
    let fileName = Date.now() + '.' + sampleFile.name.split('.').pop()
    uploadPath = path.join(__dirname, '../public/images/' + fileName);

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function (err) {
        if (err)
            return res.status(500).send(err);

        res.json({message: 'File uploaded!', file: fileName});
    });
})

module.exports = router;