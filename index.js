process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('whoops! there was an error');
});

const express = require('express')
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser')
const pinataSDK = require('@pinata/sdk');

const fs = require('fs');

const multer = require('multer');
const app = express()

app.use(express.static('dist'))
app.use(express.static('public'))
app.use(morgan('dev'));
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
app.use(cors(corsOptions))

const pinata_api_key = require("./secret.json").pinata_api_key;
const pinata_api_secret = require("./secret.json").pinata_api_secret;
const pinata = pinataSDK(pinata_api_key, pinata_api_secret);

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

      const readableStreamForFile = fs.createReadStream('./public/uploads/' + req.file.filename);
      const options = {
          pinataMetadata: {
              name: "somename",
              keyvalues: {
                  customKey: 'customValue',
                  customKey2: 'customValue2'
              }
          },
          pinataOptions: {
              cidVersion: 0
          }
      };
      pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
          //handle results here
          console.log(result);
          res.send({
            success: true,
            file: req.file,
            ipfsDetails: result
          })
      }).catch((err) => {
          //handle error here
          console.log(err);
      });


    }
  })

app.listen(3000, () => console.log('Listening on port 3000!'))
