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
const IExec = require('iexec').IExec;
const HDWalletProvider = require("@truffle/hdwallet-provider");

const RINKEBY_RPC_URL= require("./secret.json").rinkeby_rpc_url;
//const mnemonic = require("./secret.json").secret;
var pk = require("./secret.json").pk;
var privateKeys = [
  pk
];
var web3Provider = new HDWalletProvider({
  /*mnemonic: {
    phrase: mnemonic
  },*/
  privateKeys,
  providerOrUrl: RINKEBY_RPC_URL,
  pollingInterval: 16000
});

const iexec = new IExec({
  ethProvider: web3Provider, // an eth signer provider like MetaMask
});

test();

async function test(){
  const userAddress = await iexec.wallet.getAddress();
  console.log('User address:', userAddress);

  const balance = await iexec.wallet.checkBalances(userAddress);
  console.log('Nano RLC:', balance.nRLC.toString());
  console.log('Eth wei:', balance.wei.toString());

  const {
    orders
  } = await iexec.orderbook.fetchAppOrderbook("0xB41F2ca7d810345F2034939ecdFc42329706413E");
  const appOrder = orders && orders[0] && orders[0].order;
  if (!appOrder) throw Error(`no apporder found for app ${appAddress}`);

  const workerPoolRes = await iexec.orderbook.fetchWorkerpoolOrderbook(
    {workerpool: "0xAd0b7eFEc0ABF34421B668ea7bCadaC12Dd97541"}
  );
  const workerPoolOrders = workerPoolRes.orders;
  const workerpoolOrder =
  workerPoolOrders && workerPoolOrders[0] && workerPoolOrders[0].order;
  if (!workerpoolOrder)
      throw Error(`no workerpoolorder found for the selected options`);

  const requestorderToSign = await iexec.order.createRequestorder({
    app: '0xB41F2ca7d810345F2034939ecdFc42329706413E',
    appmaxprice: '1',
    workerpoolmaxprice: '1000000000',
    workerpool: "0x3ac77C495161701F9dc22A823a5a2dEe4BAb50e2",
    category: '2',
    volume: '1',
    params: {
      "iexec_input_files": ["https://filebin.net/5d8olcbp3k9vwzqx/blendfile7.blend"],
      "iexec_result_storage_provider": "ipfs"
      //"iexec_input_files": [req.body.fileName]
    }
  });


  const requestOrder = await iexec.order.signRequestorder(requestorderToSign);



  /*const res = await iexec.order.matchOrders({
    apporder: appOrder,
    requestorder: requestOrder,
    workerpoolorder: workerpoolOrder
});*/

//console.log(res);


}

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