process.on('uncaughtException', (err) => {
    console.log(err);
    console.log('whoops! there was an error');
 });

const express = require("express");
//const { request } = require("express");
require('dotenv').config();
var cors = require('cors')
const morgan = require('morgan');
const bodyParser = require('body-parser')

const app = express();
const port = 4000;

//pp.use(express.static('src'));
app.use(express.static("public"))
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
app.use(cors(corsOptions))
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
const fs = require('fs');

const multer = require('multer');


  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
      const uniquePreFix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      var fileExtension = ".blend";
      cb(null, uniquePreFix + fileExtension);
    }
  })

  const upload = multer({
    //dest: './public/uploads/',
    storage: storage, 
    limits:{
      fileSize: 100000000
    },
  })



app.post('/fileupload', upload.single('file-to-upload'), (req, res, next) => {
    if (!req.file) {
      console.error(`No file selected`)
      return res.send({
        success: false
      })
    } else {
      console.log(`File uploaded`)
      console.log(req.file);
      res.send({
        success: true,
        file: req.file,
      })
    }
  })

app.post('/createrender', (req, res, next) => {
  console.log(req.body);
  res.json({"message": "Render started."})
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})